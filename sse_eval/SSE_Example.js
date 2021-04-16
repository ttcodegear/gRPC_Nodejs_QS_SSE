var messages = require('./ServerSideExtension_pb');
var sse = require('./ServerSideExtension_grpc_pb');
var grpc = require('@grpc/grpc-js');
var _ = require("underscore");

// Function Name | Function Type  | Argument     | TypeReturn Type
// ScriptEval    | Scalar, Tensor | Numeric      | Numeric
// ScriptEvalEx  | Scalar, Tensor | Dual(N or S) | Numeric
function scriptEval(header, call) {
  console.log('script=' + header.getScript());
  // パラメータがあるか否かをチェック
  if( header.getParamsList().length > 0 ) {
    call.on('data', function(requestStream){
      var all_args = [];
      var rows = requestStream.getRowsList();
      for(var i = 0; i < rows.length; i++) {
        var script_args = [];
        (_.zip(header.getParamsList(), rows[i].getDualsList())).forEach(function(elm) {
          if( elm[0].getDatatype() == messages.DataType.NUMERIC || elm[0].getDatatype() == messages.DataType.DUAL )
            script_args.push(elm[1].getNumdata());
          else
            script_args.push(elm[1].getStrdata());
        });
        console.log('args=', script_args);
        all_args.push(script_args);
      }
      var all_results = [];
      all_args.forEach(function(script_args) {
        var result = NaN;
        try {
          var func = new Function(header.getScript());
          result = func.call(null, script_args, _);
        }
        catch(error) {
          console.log(error);
        }
        all_results.push(result);
      });
      var response_rows = [];
      all_results.forEach(function(result) {
        if( !Array.isArray(result) ) {
          var row = new messages.Row();
          var dual = new messages.Dual();
          dual.setNumdata(result);
          row.setDualsList([dual]);
          response_rows.push(row);;
        }
        else {
          result.forEach(function(elm) {
            var row = new messages.Row();
            var dual = new messages.Dual();
            dual.setNumdata(elm);
            row.setDualsList([dual]);
            response_rows.push(row);
          });
        }
      });
      var reply = new messages.BundledRows();
      reply.setRowsList(response_rows);
      call.write(reply);
    });
    call.on('end', function(){
      call.end();
    });
  }
  else {
    call.on('data', function(requestStream){
    });
    call.on('end', function(){
      var script_args = [];
      var result = NaN;
      try {
        var func = new Function(header.getScript());
        result = func.call(null, script_args, _);
      }
      catch(error) {
        console.log(error);
      }
      if( !Array.isArray(result) ) {
        var reply = new messages.BundledRows();
        var row = new messages.Row();
        var dual = new messages.Dual();
        dual.setNumdata(result);
        row.setDualsList([dual]);
        reply.setRowsList([row]);
        call.write(reply);
      }
      else {
        var response_rows = [];
        result.forEach(function(elm) {
          var row = new messages.Row();
          var dual = new messages.Dual();
          dual.setNumdata(elm);
          row.setDualsList([dual]);
          response_rows.push(row);
        });
        var reply = new messages.BundledRows();
        reply.setRowsList(response_rows);
        call.write(reply);
      }
      call.end();
    });
  }
}

// Function Name   | Function Type | Argument     | TypeReturn Type
// ScriptAggrStr   | Aggregation   | String       | String
// ScriptAggrExStr | Aggregation   | Dual(N or S) | String
function scriptAggrStr(header, call) {
  console.log('script=' + header.getScript());
  // パラメータがあるか否かをチェック
  if( header.getParamsList().length > 0 ) {
    var all_args = [];
    call.on('data', function(requestStream){
      var rows = requestStream.getRowsList();
      for(var i = 0; i < rows.length; i++) {
        var script_args = [];
        (_.zip(header.getParamsList(), rows[i].getDualsList())).forEach(function(elm) {
          if( elm[0].getDatatype() == messages.DataType.STRING || elm[0].getDatatype() == messages.DataType.DUAL )
            script_args.push(elm[1].getStrdata());
          else
            script_args.push(elm[1].getNumdata());
        });
        all_args.push(script_args);
      }
    });
    call.on('end', function(){
      console.log('args=', all_args);
      var result = NaN;
      try {
        var func = new Function(header.getScript());
        result = func.call(null, all_args, _);
      }
      catch(error) {
        console.log(error);
      }
      if( !Array.isArray(result) ) {
        var reply = new messages.BundledRows();
        var row = new messages.Row();
        var dual = new messages.Dual();
        dual.setStrdata(String(result));
        row.setDualsList([dual]);
        reply.setRowsList([row]);
        call.write(reply);
      }
      else {
        var response_rows = [];
        result.forEach(function(elm) {
          var row = new messages.Row();
          var dual = new messages.Dual();
          dual.setStrdata(String(elm));
          row.setDualsList([dual]);
          response_rows.push(row);
        });
        var reply = new messages.BundledRows();
        reply.setRowsList(response_rows);
        call.write(reply);
      }
      call.end();
    });
  }
  else {
    call.on('data', function(requestStream){
    });
    call.on('end', function(){
      var script_args = [];
      var result = NaN;
      try {
        var func = new Function(header.getScript());
        result = func.call(null, script_args, _);
      }
      catch(error) {
        console.log(error);
      }
      if( !Array.isArray(result) ) {
        var reply = new messages.BundledRows();
        var row = new messages.Row();
        var dual = new messages.Dual();
        dual.setStrdata(String(result));
        row.setDualsList([dual]);
        reply.setRowsList([row]);
        call.write(reply);
      }
      else {
        var response_rows = [];
        result.forEach(function(elm) {
          var row = new messages.Row();
          var dual = new messages.Dual();
          dual.setStrdata(String(elm));
          row.setDualsList([dual]);
          response_rows.push(row);
        });
        var reply = new messages.BundledRows();
        reply.setRowsList(response_rows);
        call.write(reply);
      }
      call.end();
    });
  }
}

function getFunctionName(header) {
  var func_type = header.getFunctiontype();
  var arg_types = header.getParamsList().map(param => param.getDatatype());
  var ret_type  = header.getReturntype();
  /*
  if( func_type == messages.FunctionType.SCALAR || func_type == messages.FunctionType.TENSOR )
    console.log('func_type SCALAR TENSOR');
  else if( func_type == messages.FunctionType.AGGREGATION )
    console.log('func_type AGGREGATION');

  if( arg_types.length == 0 )
    console.log('arg_type Empty');
  else if( arg_types.every(a => a == messages.DataType.NUMERIC) )
    console.log('arg_type NUMERIC');
  else if( arg_types.every(a => a == messages.DataType.STRING) )
    console.log('arg_type STRING');
  else if( (new Set(arg_types)).size >= 2 || arg_types.every(a => a == messages.DataType.DUAL) )
    console.log('arg_type DUAL');

  if( ret_type == messages.DataType.NUMERIC )
    console.log('ret_type NUMERIC');
  else if( ret_type == messages.DataType.STRING )
    console.log('ret_type STRING');
  */
  if( func_type == messages.FunctionType.SCALAR || func_type == messages.FunctionType.TENSOR )
    if( arg_types.length == 0 || arg_types.every(a => a == messages.DataType.NUMERIC) )
      if( ret_type == messages.DataType.NUMERIC )
        return 'ScriptEval';

  if( func_type == messages.FunctionType.SCALAR || func_type == messages.FunctionType.TENSOR )
    if( (new Set(arg_types)).size >= 2 || arg_types.every(a => a == messages.DataType.DUAL) )
      if( ret_type == messages.DataType.NUMERIC )
        return 'ScriptEvalEx';

  if( func_type == messages.FunctionType.AGGREGATION )
    if( arg_types.length == 0 || arg_types.every(a => a == messages.DataType.STRING) )
      if( ret_type == messages.DataType.STRING )
        return 'ScriptAggrStr';

  if( func_type == messages.FunctionType.AGGREGATION )
    if( (new Set(arg_types)).size >= 2 || arg_types.every(a => a == messages.DataType.DUAL) )
      if( ret_type == messages.DataType.STRING )
        return 'ScriptAggrExStr';

  return 'Unsupported Function Name';
}

function evaluateScript(call) {
  console.log('evaluateScript');
  var md = new grpc.Metadata();
  md.set('qlik-cache', 'no-store'); // Disable caching
  call.sendMetadata(md);

  // Read gRPC metadata
  var header = call.metadata.get('qlik-scriptrequestheader-bin')[0];
  header = messages.ScriptRequestHeader.deserializeBinary(header);
  var func_name = getFunctionName(header);
  if(func_name == 'ScriptEval' || func_name == 'ScriptEvalEx')
    return scriptEval(header, call);
  if(func_name == 'ScriptAggrStr' || func_name == 'ScriptAggrExStr')
    return scriptAggrStr(header, call);

  throw new Error('Method not implemented!');
}

function getCapabilities(call, callback) {
  console.log('getCapabilities');
  var capabilities = new messages.Capabilities();
  capabilities.setAllowscript(true);
  capabilities.setPluginidentifier('Simple SSE Test');
  capabilities.setPluginversion('v0.0.1');
  callback(null, capabilities);
}

var server = new grpc.Server();
server.addService(sse.ConnectorService, {
                    getCapabilities: getCapabilities,
                    evaluateScript: evaluateScript
                  });
server.bindAsync('0.0.0.0:50053',
                 grpc.ServerCredentials.createInsecure(),
                 (err, port) => {server.start();});
