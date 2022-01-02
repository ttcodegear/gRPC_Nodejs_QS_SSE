var messages = require('./ServerSideExtension_pb');
var sse = require('./ServerSideExtension_grpc_pb');
var grpc = require('@grpc/grpc-js');
var BigNumber = require('bignumber.js');

function bigSum(call) {
  console.log('bigSum');
  var params = [];
  call.on('data', function(requestStream){
    var rows = requestStream.getRowsList();
    for(var i = 0; i < rows.length; i++) {
      var param = rows[i].getDualsList()[0].getStrdata(); // row=[Col1]
      params.push(new BigNumber(param));
    }
  });
  call.on('end', function(){
    var result = params.reduce((a, b) => a.plus(b), new BigNumber('0')); // Col1 + Col1 + ...
    var reply = new messages.BundledRows();
    var row = new messages.Row();
    var dual = new messages.Dual();
    console.log(result.toFixed());
    dual.setStrdata(result.toFixed());
    row.setDualsList([dual]);
    reply.setRowsList([row]);
    call.write(reply);
    call.end();
  });
}

function bigAdd(call) {
  console.log('bigAdd');
  call.on('data', function(requestStream){
    var response_rows = [];
    var rows = requestStream.getRowsList();
    for(var i = 0; i < rows.length; i++) {
      var param1 = rows[i].getDualsList()[0].getStrdata(); // row=[Col1,Col2]
      var param2 = rows[i].getDualsList()[1].getStrdata();
      var result = (new BigNumber(param1)).plus(new BigNumber(param2)); // Col1 + Col2
      var row = new messages.Row();
      var dual = new messages.Dual();
      console.log(result.toFixed());
      dual.setStrdata(result.toFixed());
      row.setDualsList([dual]);
      response_rows.push(row);
    }
    var reply = new messages.BundledRows();
    reply.setRowsList(response_rows);
    call.write(reply);
  });
  call.on('end', function(){
    call.end();
  });
}

function getFunctionId(call) {
  // Read gRPC metadata
  var header = call.metadata.get('qlik-functionrequestheader-bin')[0];
  header = messages.FunctionRequestHeader.deserializeBinary(header);
  return header.getFunctionid();
}

function executeFunction(call) {
  console.log('executeFunction');
  var md = new grpc.Metadata();
  md.set('qlik-cache', 'no-store'); // Disable caching
  call.sendMetadata(md);

  var func_id = getFunctionId(call);
  if(func_id == 0)
    return bigSum(call);
  else if(func_id == 1)
    return bigAdd(call);
  else
    throw new Error('Method not implemented!');
}

function getCapabilities(call, callback) {
  console.log('getCapabilities');
  var capabilities = new messages.Capabilities();
  capabilities.setAllowscript(false);
  capabilities.setPluginidentifier('Simple SSE Test');
  capabilities.setPluginversion('v0.0.1');

  // bigSum
  var func0 = new messages.FunctionDefinition();
  func0.setFunctionid(0);                                   // 関数ID
  func0.setName('bigSum');                                  // 関数名
  func0.setFunctiontype(messages.FunctionType.AGGREGATION); // 関数タイプ=0=スカラー,1=集計,2=テンソル
  func0.setReturntype(messages.DataType.STRING);            // 関数戻り値=0=文字列,1=数値,2=Dual
  var func0_p1 = new messages.Parameter();
  func0_p1.setName('col1');                                 // パラメータ名
  func0_p1.setDatatype(messages.DataType.STRING);           // パラメータタイプ=0=文字列,1=数値,2=Dual
  func0.setParamsList([func0_p1]);

  // bigAdd
  var func1 = new messages.FunctionDefinition();
  func1.setFunctionid(1);                                   // 関数ID
  func1.setName('bigAdd');                                  // 関数名
  func1.setFunctiontype(messages.FunctionType.TENSOR);      // 関数タイプ=0=スカラー,1=集計,2=テンソル
  func1.setReturntype(messages.DataType.STRING);            // 関数戻り値=0=文字列,1=数値,2=Dual
  var func1_p1 = new messages.Parameter();
  func1_p1.setName('col1');                                 // パラメータ名
  func1_p1.setDatatype(messages.DataType.STRING);           // パラメータタイプ=0=文字列,1=数値,2=Dual
  var func1_p2 = new messages.Parameter();
  func1_p2.setName('col2');                                 // パラメータ名
  func1_p2.setDatatype(messages.DataType.STRING);           // パラメータタイプ=0=文字列,1=数値,2=Dual
  func1.setParamsList([func1_p1, func1_p2]);

  capabilities.setFunctionsList([func0, func1]);
  callback(null, capabilities);
}

var server = new grpc.Server();
server.addService(sse.ConnectorService, {
                    getCapabilities: getCapabilities,
                    executeFunction: executeFunction
                  });
server.bindAsync('0.0.0.0:50053',
                 grpc.ServerCredentials.createInsecure(),
                 (err, port) => {server.start();});
