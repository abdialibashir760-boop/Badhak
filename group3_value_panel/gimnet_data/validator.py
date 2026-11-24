"""Structural validation for GIM NET Data Format v0.1.

All documented required fields and supported enum values are checked. Results
are accepted as an opaque solver-owned object (or null) and preserved verbatim.
"""
import math

class NetworkValidationError(ValueError):
    def __init__(self, errors):
        self.errors = list(errors)
        super().__init__('Network validation failed:\n' + '\n'.join(f'- {e}' for e in self.errors))

NODE_FIELDS = {
    'junctions': ('id','x','y','elevation','demand'),
    'reservoirs': ('id','x','y','head'),
    'tanks': ('id','x','y','elevation','init_level','min_level','max_level','diameter')
}
PIPE_FIELDS = ('id','from','to','length','diameter','roughness','minor_loss','status')
META_FIELDS = ('title','author','created','description')
OPTION_FIELDS = ('flow_units','headloss','viscosity_m2s','accuracy','max_iterations','solver',
                 'min_pressure_m','max_pressure_m','min_velocity_ms','max_velocity_ms')
REQUIRED = ('format','version','meta','options','junctions','reservoirs','tanks','pipes','pumps','valves','patterns','results')

def _number(value):
    return type(value) in (int,float) and math.isfinite(value)

def validate_network(data):
    """Return list of human-readable issues, empty if valid; never modify input."""
    errors = []
    if not isinstance(data, dict):
        return ['Root: expected a JSON object.']
    for field in REQUIRED:
        if field not in data:
            errors.append(f'Root: missing required field "{field}".')
    if data.get('format') != 'GIMNET':
        errors.append('format: expected "GIMNET".')
    if data.get('version') != '0.1':
        errors.append('version: expected "0.1".')
    for section, fields in (('meta',META_FIELDS),('options',OPTION_FIELDS)):
        obj = data.get(section)
        if not isinstance(obj,dict):
            errors.append(f'{section}: expected an object.')
            continue
        for field in fields:
            if field not in obj or obj[field] is None:
                errors.append(f'{section}.{field}: missing required value.')
        if section == 'meta':
            for f in fields:
                if f in obj and not isinstance(obj[f],str):
                    errors.append(f'meta.{f}: expected text.')
        else:
            for f in ('flow_units','headloss','solver'):
                if f in obj and (not isinstance(obj[f],str) or not obj[f].strip()):
                    errors.append(f'options.{f}: expected nonempty text.')
            if obj.get('flow_units') != 'LPS':
                errors.append('options.flow_units: expected LPS.')
            if obj.get('headloss') not in ('HW','DW'):
                errors.append('options.headloss: expected HW or DW.')
            for f in ('viscosity_m2s','accuracy','min_pressure_m','max_pressure_m','min_velocity_ms','max_velocity_ms'):
                if f in obj and not _number(obj[f]):
                    errors.append(f'options.{f}: must be a finite number.')
            for f in ('viscosity_m2s','accuracy'):
                if _number(obj.get(f)) and obj[f] <= 0:
                    errors.append(f'options.{f}: must be positive.')
            k = obj.get('max_iterations')
            if k is not None and (type(k) is not int or k <= 0):
                errors.append('options.max_iterations: must be a positive integer.')
            for low, high in (('min_pressure_m','max_pressure_m'),('min_velocity_ms','max_velocity_ms')):
                if _number(obj.get(low)) and _number(obj.get(high)) and obj[low] > obj[high]:
                    errors.append(f'options: {low} exceeds {high}.')
    all_ids = set(); node_ids=set()
    for section, fields in NODE_FIELDS.items():
        items=data.get(section)
        if not isinstance(items,list):
            errors.append(f'{section}: expected a list.'); continue
        for i,item in enumerate(items):
            label=f'{section}[{i}]'
            if not isinstance(item,dict):
                errors.append(f'{label}: expected an object.'); continue
            for f in fields:
                if f not in item or item[f] is None or (f=='id' and item[f]==''):
                    errors.append(f'{label}.{f}: missing required value.')
            ident=item.get('id')
            if not isinstance(ident,str) or not ident.strip():
                errors.append(f'{label}.id: expected nonempty text.')
            elif ident in all_ids:
                errors.append(f'{label}.id: duplicate ID "{ident}".')
            else:
                all_ids.add(ident); node_ids.add(ident)
            for f in fields:
                if f != 'id' and f in item and not _number(item[f]):
                    errors.append(f'{label}.{f}: must be a finite number.')
            if section == 'tanks':
                if _number(item.get('diameter')) and item['diameter'] <= 0:
                    errors.append(f'{label}.diameter: must be positive.')
                for f in ('init_level','min_level','max_level'):
                    if _number(item.get(f)) and item[f]<0:
                        errors.append(f'{label}.{f}: must not be negative.')
                if all(_number(item.get(f)) for f in ('init_level','min_level','max_level')):
                    if not item['min_level']<=item['init_level']<=item['max_level']:
                        errors.append(f'{label}: expected min_level <= init_level <= max_level.')
    pipes=data.get('pipes')
    if not isinstance(pipes,list):
        errors.append('pipes: expected a list.')
    else:
        for i,item in enumerate(pipes):
            label=f'pipes[{i}]'
            if not isinstance(item,dict):
                errors.append(f'{label}: expected an object.'); continue
            for f in PIPE_FIELDS:
                if f not in item or item[f] is None or (f in ('id','from','to') and item[f]==''):
                    errors.append(f'{label}.{f}: missing required value.')
            ident=item.get('id')
            if not isinstance(ident,str) or not ident.strip():
                errors.append(f'{label}.id: expected nonempty text.')
            elif ident in all_ids:
                errors.append(f'{label}.id: duplicate ID "{ident}".')
            else:
                all_ids.add(ident)
            for endpoint in ('from','to'):
                if not isinstance(item.get(endpoint),str) or item[endpoint] not in node_ids:
                    errors.append(f'{label}.{endpoint}: node "{item.get(endpoint)}" does not exist.')
            if item.get('from') == item.get('to') and isinstance(item.get('from'),str):
                errors.append(f'{label}: a pipe cannot connect a node to itself.')
            for f in ('length','diameter','roughness','minor_loss'):
                if f in item and not _number(item[f]):
                    errors.append(f'{label}.{f}: must be a finite number.')
            for f in ('length','diameter','roughness'):
                if _number(item.get(f)) and item[f] <= 0:
                    errors.append(f'{label}.{f}: must be positive.')
            if _number(item.get('minor_loss')) and item['minor_loss'] < 0:
                errors.append(f'{label}.minor_loss: must not be negative.')
            if item.get('status') not in ('OPEN','CLOSED','CV'):
                errors.append(f'{label}.status: expected OPEN, CLOSED or CV.')
    for section in ('pumps','valves','patterns'):
        value=data.get(section)
        if not isinstance(value,list):
            errors.append(f'{section}: expected a list.')
        elif value:
            errors.append(f'{section}: v0.1 requires an empty list.')
    if 'results' in data and data['results'] is not None and not isinstance(data['results'],dict):
        errors.append('results: expected null or an object.')
    return errors

def require_valid(data):
    errors=validate_network(data)
    if errors:
        raise NetworkValidationError(errors)
    return data
