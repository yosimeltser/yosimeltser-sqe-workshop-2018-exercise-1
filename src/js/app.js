import $ from 'jquery';
import {parseCode} from './code-analyzer';
//TABLE OF THE MODEL LAYER WILL BE TRANSFORMED INTO HTML
function initTable(){
    let table=new Array(5);
    for (let i=0;i<5;i++ ){
        table[i]=new Array();
    }
    return table;
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        codeParse(parsedCode.body,initTable());
    });
});

//HANDLERS
let func= (parsedCode,table) => {
    addRowToTable(parsedCode.id.loc.start.line,parsedCode.type,parsedCode.id.name,"","",table);
    parsedCode.params.forEach(function (parameter){
        addRowToTable(parameter.loc.start.line,"variable declaration",parameter.name,"","null (or nothing)",table);
    })
    codeParse(parsedCode.body,table);
}
let block= (parsedCode,table) => {
    codeParse(parsedCode.body,table);
}
let variable= (parsedCode,table) => {
    parsedCode.declarations.forEach(function (variable){
        addRowToTable(variable.id.loc.start.line,"variable declaration",variable.id.name,"","",table);
    })
}
let expr= (parsedCode,table) => {
    codeParse(parsedCode.expression,table);
    }
let assignment= (parsedCode,table) => {
    //RIGHT LEAF IS A VALUE
    if (parsedCode.right.type==="Literal"){
        addRowToTable(parsedCode.left.loc.start.line,"assignment expression",parsedCode.left.name,"",parsedCode.right.value,table);
    }
    //RIGHT LEAF IS A BINARY EXPRESSION
    else if (parsedCode.right.type==="BinaryExpression"){
        let value=binaryExpression(parsedCode.right);
        addRowToTable(parsedCode.left.loc.start.line,"assignment expression",parsedCode.left.name,"",value,table);
    }
}
let whileSt= (parsedCode,table) => {
    let line= parsedCode.test.left.loc.start.line;
    let type= parsedCode.type;
    let name="";
    let condition=binaryExpression(parsedCode.test);
    let value="";
    addRowToTable(line,type,name,condition,value,table);
    codeParse(parsedCode.body,table);
}
let ret = (parsedCode,table) => {
    let line= parsedCode.argument.loc.start.line;
    let type= parsedCode.type;
    let name="";
    let condition="";
    let value=termCheck(parsedCode.argument);
    addRowToTable(line,type,name,condition,value,table);
}
let ifState = (parsedCode,table) => {
    let line= parsedCode.test.left.loc.start.line;
    let type= parsedCode.type;
    let name="";
    let condition="";
    let value="";
    addRowToTable(line,type,name,condition,value,table);
    codeParse(parsedCode.consequent,table);
    if (parsedCode.alternate!=undefined)
        codeParse(parsedCode.alternate,table);
}
// MAPS = > (TYPE,FUNCTION)
const arrayOfFunctions= {
    FunctionDeclaration: func,
    BlockStatement: block,
    IfStatement: ifState,
    VariableDeclaration: variable,
    ExpressionStatement: expr,
    AssignmentExpression: assignment,
    WhileStatement: whileSt,
    ReturnStatement: ret
}
function codeParse(parsedCode,table){
    if (Array.isArray(parsedCode)) {
        parsedCode.forEach(function (Element){
            arrayOfFunctions[Element.type](Element,table);
        })
    }
    else {
        arrayOfFunctions[parsedCode.type](parsedCode,table);
    }
}
//HELP FUNCTIONS
function binaryExpression(object){
    if (object.left.type!=="BinaryExpression"){
        return termCheck(object.left )+ object.operator  +termCheck(object.right);
    }
    else {
        return binaryExpression(object.left)+object.operator  +termCheck(object.right);
    }
}
//RETURNS A TERM -> NUMBER OR VAR ,ACCORDING TO IDENTIFIER OR LATERAL
function termCheck(object){
    if (object.type=="Literal"){
        return object.value;
    }
    else if (object.type=="Identifier") {
        return object.name;
    }
    else if (checkIfMemberExpression(object)){
        return  MemberExpression(object);
    }
}
function MemberExpression(object){
    return object.object.name+"[" + object.property.name +"]";
}
function checkIfMemberExpression(object){
    if(object.type==="MemberExpression")
        return true;
    else
        return false;
}
function  addRowToTable(Line,Type,Name,Condition,Value,table){
    table[0].push(Line);
    table[1].push(Type);
    table[2].push(Name);
    table[3].push(Condition);
    table[4].push(Value);
}
// arrayOfFunctions.Identifier("hi");
// arrayOfFunctions.Function("hi");
// arrayOfFunctions.BlockStatement("hi");
// arrayOfFunctions.Variable("hi")