var messages = require('./ServerSideExtension_pb');
var sse = require('./ServerSideExtension_grpc_pb');
var grpc = require('@grpc/grpc-js');
var fs = require('fs');

function sumOfColumn(call) {
  console.log('sumOfColumn');
  var params = [];
  call.on('data', function(requestStream){
    var rows = requestStream.getRowsList();
    for(var i = 0; i < rows.length; i++) {
      var param = rows[i].getDualsList()[0].getNumdata(); // row=[Col1]
      params.push(param);
    }
  });
  call.on('end', function(){
    var result = params.reduce((a, b) => a + b, 0); // Col1 + Col1 + ...
    var reply = new messages.BundledRows();
    var row = new messages.Row();
    var dual = new messages.Dual();
    dual.setNumdata(result);
    row.setDualsList([dual]);
    reply.setRowsList([row]);
    call.write(reply);
    call.end();
  });
}

function sumOfRows(call) {
  console.log('sumOfRows');
  call.on('data', function(requestStream){
    var response_rows = [];
    var rows = requestStream.getRowsList();
    for(var i = 0; i < rows.length; i++) {
      var param1 = rows[i].getDualsList()[0].getNumdata(); // row=[Col1,Col2]
      var param2 = rows[i].getDualsList()[1].getNumdata();
      var result = param1 + param2; // Col1 + Col2
      var row = new messages.Row();
      var dual = new messages.Dual();
      dual.setNumdata(result);
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
    return sumOfColumn(call);
  else if(func_id == 1)
    return sumOfRows(call);
  else
    throw new Error('Method not implemented!');
}

function getCapabilities(call, callback) {
  console.log('getCapabilities');
  var capabilities = new messages.Capabilities();
  capabilities.setAllowscript(false);
  capabilities.setPluginidentifier('Simple SSE Test');
  capabilities.setPluginversion('v0.0.1');

  // SumOfColumn
  var func0 = new messages.FunctionDefinition();
  func0.setFunctionid(0);                                   // ??????ID
  func0.setName('SumOfColumn');                             // ?????????
  func0.setFunctiontype(messages.FunctionType.AGGREGATION); // ???????????????=0=????????????,1=??????,2=????????????
  func0.setReturntype(messages.DataType.NUMERIC);           // ???????????????=0=?????????,1=??????,2=Dual
  var func0_p1 = new messages.Parameter();
  func0_p1.setName('col1');                                 // ??????????????????
  func0_p1.setDatatype(messages.DataType.NUMERIC);          // ????????????????????????=0=?????????,1=??????,2=Dual
  func0.setParamsList([func0_p1]);

  // SumOfRows
  var func1 = new messages.FunctionDefinition();
  func1.setFunctionid(1);                                   // ??????ID
  func1.setName('SumOfRows');                               // ?????????
  func1.setFunctiontype(messages.FunctionType.TENSOR);      // ???????????????=0=????????????,1=??????,2=????????????
  func1.setReturntype(messages.DataType.NUMERIC);           // ???????????????=0=?????????,1=??????,2=Dual
  var func1_p1 = new messages.Parameter();
  func1_p1.setName('col1');                                 // ??????????????????
  func1_p1.setDatatype(messages.DataType.NUMERIC);          // ????????????????????????=0=?????????,1=??????,2=Dual
  var func1_p2 = new messages.Parameter();
  func1_p2.setName('col2');                                 // ??????????????????
  func1_p2.setDatatype(messages.DataType.NUMERIC);          // ????????????????????????=0=?????????,1=??????,2=Dual
  func1.setParamsList([func1_p1, func1_p2]);

  capabilities.setFunctionsList([func0, func1]);
  callback(null, capabilities);
}

var cacert = fs.readFileSync("./root_cert.pem");
var cert_chain = fs.readFileSync("./sse_server_cert.pem");
var private_key = fs.readFileSync("./sse_server_key.pem");
var credentials = grpc.ServerCredentials.createSsl(
  cacert, // Root CA certificates for validating client certificates
  [{cert_chain, private_key}],
  true   // checkClientCertificate(true/false)
);

var server = new grpc.Server();
server.addService(sse.ConnectorService, {
                    getCapabilities: getCapabilities,
                    executeFunction: executeFunction
                  });
server.bindAsync('0.0.0.0:50053',
                 credentials,
                 (err, port) => {server.start();});
