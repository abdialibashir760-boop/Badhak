const ts=require('typescript');
const fs=require('fs'), path=require('path');
const dict=JSON.parse(fs.readFileSync(path.join(__dirname,'dict.json'),'utf8'));
const SKIP=new Set(['src','n','color','pos','id','key','hue','style','font','fill','stroke','kind','type','layout','align','fontFamily','viewBox','points','d','x','y','width','height','transform','className','rot','anchor','names']);
const [,, outDir, ...files]=process.argv; fs.mkdirSync(outDir,{recursive:true});
let total=0, missed=[];
for(const f of files){
  const src=fs.readFileSync(f,'utf8'); const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const edits=[];
  function visit(n,ctx){
    if(ts.isImportDeclaration(n)) return;
    if(ts.isJsxAttribute(n)){const name=n.name.getText(); if(name==='style'||SKIP.has(name)) return; ts.forEachChild(n,c=>visit(c,name)); return;}
    if(ts.isJsxText(n)){
      const raw=n.getText(); const t=raw.replace(/\s+/g,' ').trim();
      if(t && Object.prototype.hasOwnProperty.call(dict,t)){
        const lead=raw.match(/^\s*/)[0], trail=raw.match(/\s*$/)[0];
        edits.push([n.getStart(),n.getEnd(),lead+dict[t].trim()+trail]);
      }
    } else if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){
      const par=n.parent;
      const ok=(ctx && !SKIP.has(ctx) && !ts.isPropertyAssignment(par)) || (ctx && ts.isArrayLiteralExpression(par)) || (ts.isPropertyAssignment(par) && par.name.getText()==='label');
      if(ok && Object.prototype.hasOwnProperty.call(dict,n.text)){
        const q=src[n.getStart()];
        edits.push([n.getStart()+1,n.getEnd()-1,dict[n.text]]);
      }
    }
    ts.forEachChild(n,c=>visit(c,ctx));
  }
  visit(sf,null);
  edits.sort((a,b)=>b[0]-a[0]);
  let out=src; for(const [s,e,r] of edits){out=out.slice(0,s)+r+out.slice(e);}
  out=out.replace(/from "\.\/(ui|theme|data|geo|Map)"/g,'from "../$1"').replace(/from "\.\/scenes3"/g,'from "../scenes3"');
  fs.writeFileSync(path.join(outDir,path.basename(f)),out); total+=edits.length;
}
console.log('edits applied',total);
