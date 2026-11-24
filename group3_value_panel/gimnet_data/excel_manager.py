"""GIM NET workbook conversion using openpyxl.

Network sheets: junctions, reservoirs, tanks, pipes; meta and options are
key-value sheets. Auxiliary preserved_results stores results as JSON text;
this is explicitly an implementation aid, NOT a GIM NET standard sheet.
"""
import copy
import json
from pathlib import Path
from openpyxl import Workbook, load_workbook
from .validator import NODE_FIELDS,PIPE_FIELDS,META_FIELDS,OPTION_FIELDS,require_valid,NetworkValidationError

FIELDS={**NODE_FIELDS,'pipes':PIPE_FIELDS}
NUMBER_FIELDS={ 'junctions':('x','y','elevation','demand'),
 'reservoirs':('x','y','head'),
 'tanks':('x','y','elevation','init_level','min_level','max_level','diameter'),
 'pipes':('length','diameter','roughness','minor_loss')}
OPTION_NUMBERS=('viscosity_m2s','accuracy','min_pressure_m','max_pressure_m','min_velocity_ms','max_velocity_ms')

def export_excel(data,path):
    require_valid(data)
    wb=Workbook(); wb.remove(wb.active)
    for section,keys in FIELDS.items():
        ws=wb.create_sheet(section); ws.append(keys)
        for item in data[section]: ws.append([item[k] for k in keys])
        ws.freeze_panes='A2'; ws.auto_filter.ref=ws.dimensions
        for col in ws.columns:
            letter=col[0].column_letter
            ws.column_dimensions[letter].width=max(14,min(24,max(len(str(cell.value or '')) for cell in col)+2))
    for section,keys in (('meta',META_FIELDS),('options',OPTION_FIELDS)):
        ws=wb.create_sheet(section);ws.append(['field','value'])
        for k in keys: ws.append([k,data[section][k]])
        ws.column_dimensions['A'].width=25;ws.column_dimensions['B'].width=58
    ws=wb.create_sheet('results_nodes');ws.append(['id','head','pressure','demand'])
    ws2=wb.create_sheet('results_links');ws2.append(['id','flow','velocity','headloss','unit_headloss','status'])
    results=data['results']
    if isinstance(results,dict):
        for ident,item in results.get('nodes',{}).items():
            ws.append([ident]+[item.get(k) for k in ('head','pressure','demand')])
        for ident,item in results.get('links',{}).items():
            ws2.append([ident]+[item.get(k) for k in ('flow','velocity','headloss','unit_headloss','status')])
    ws=wb.create_sheet('preserved_results')
    ws['A1']='Original results JSON (lossless round-trip; do not manually edit)'
    # Excel cell limit 32767 characters; split in multiple sequential chunks.
    blob=json.dumps(results,ensure_ascii=False,separators=(',',':'),allow_nan=False)
    for idx,start in enumerate(range(0,len(blob),30000),start=2): ws.cell(idx,1,blob[start:start+30000])
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True);wb.save(path)
    return path

def import_excel(path):
    wb=load_workbook(path,read_only=True,data_only=True)
    try:
        required=set(FIELDS)|{'meta','options'}
        missing=required-set(wb.sheetnames)
        if missing: raise ValueError('Missing Excel sheets: '+', '.join(sorted(missing)))
        output={'format':'GIMNET','version':'0.1'}
        for section,keys in (('meta',META_FIELDS),('options',OPTION_FIELDS)):
            rows=wb[section].iter_rows(values_only=True)
            next(rows,None)
            output[section]={k:v for k,v,*_ in rows if k is not None}
        for section,keys in FIELDS.items():
            rows=wb[section].iter_rows(values_only=True)
            header=next(rows,None)
            if header is None or tuple(header[:len(keys)])!=tuple(keys):
                raise ValueError(f'{section}: incorrect column headings. Expected {keys}')
            values=[]
            for row in rows:
                if all(v is None for v in row):continue
                values.append({k:row[idx] if idx<len(row) else None for idx,k in enumerate(keys)})
            output[section]=values
        for section in ('pumps','valves','patterns'):output[section]=[]
        output['results']=None
        if 'preserved_results' in wb.sheetnames:
            parts=[r[0] for r in wb['preserved_results'].iter_rows(min_row=2,max_col=1,values_only=True) if isinstance(r[0],str)]
            if parts:
                try:output['results']=json.loads(''.join(parts))
                except json.JSONDecodeError as ex:raise ValueError('Invalid preserved_results JSON in Excel workbook') from ex
        # For manually authored sheets without preserved_results, reconstruct basic results.
        elif 'results_nodes' in wb.sheetnames or 'results_links' in wb.sheetnames:
            output['results']=None
        return require_valid(output)
    finally:wb.close()
