const ts=require('typescript');
const fs=require('fs');
const files=process.argv.slice(2); const out={};
const SKIPATTR=new Set(['src','n','color','pos','id','key','hue','style','font','fill','stroke','kind','type','layout','align','fontFamily','viewBox','points','d','x','y','width','height','transform','className','rot','anchor','names']);
function isText(s){return /[A-Za-zÀ-ž]{2,}/.test(s) && !/^(#|rgba?\(|linear-|radial-)/.test(s) && !['userSpaceOnUse','middle'].includes(s) && !/^[\w.-]+\.(jpg|png|wav)$/.test(s)}
for(const f of files){
  const src=fs.readFileSync(f,'utf8'); const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const found=new Set();
  function visit(n,ctx){
    if(ts.isImportDeclaration(n)) return;
    if(ts.isJsxAttribute(n)){
      const name=n.name.getText(); 
      if(name==='style'||SKIPATTR.has(name)) return;
      ts.forEachChild(n,c=>visit(c,name)); return;
    }
    if(ts.isJsxText(n)){const t=n.getText().replace(/\s+/g,' ').trim(); if(t&&isText(t)) found.add(t);}
    else if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){
      const par=n.parent; 
      if(ctx && !SKIPATTR.has(ctx) && isText(n.text) && !ts.isPropertyAssignment(par) ) found.add(n.text);
      if(ctx && ts.isArrayLiteralExpression(par) && isText(n.text)) found.add(n.text);
    }
    ts.forEachChild(n,c=>visit(c,ctx));
  }
  visit(sf,null);
  out[f]=[...found];
}
fs.writeFileSync(require('path').join(__dirname,'strings.json'),JSON.stringify(out,null,1));
let all=new Set(); Object.values(out).forEach(a=>a.forEach(x=>all.add(x))); console.log('files',files.length,'unique strings',all.size);
