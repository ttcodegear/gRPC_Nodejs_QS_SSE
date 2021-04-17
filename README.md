# gRPC_Nodejs_QS_SSE
$>node --version

  v12.21.0

$>npm install -g grpc-tools

$>npm list -g

  +-- grpc-tools@1.11.1

$>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:[protohub_path] --grpc_out=grpc_js:[grpc_path] proto_file_path

$>ls *_pb*

  xxxx_pb.js

  xxxx_grpc_pb.js





$>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=grpc_js:./ ./helloworld.proto

$>npm install @grpc/proto-loader google-protobuf @grpc/grpc-js

$>node greeter_server.js

$>node greeter_client.js





$>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=grpc_js:./ ./hellostreamingworld.proto

$>npm install @grpc/proto-loader google-protobuf @grpc/grpc-js

$>node greeter_stream_server.js

$>node greeter_stream_client.js





$>openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 3650 -out server.crt

$>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=grpc_js:./ ./helloworld.proto

$>npm install @grpc/proto-loader google-protobuf @grpc/grpc-js

$>node greeter_ssl_server.js

$>node greeter_ssl_client.js





$>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=grpc_js:./ ./ServerSideExtension.proto

$>npm install @grpc/proto-loader google-protobuf @grpc/grpc-js undercore

$>node SSE_Example.js



C:\Users\[user]\Documents\Qlik\Sense\Settings.ini

------

[Settings 7]

SSEPlugin=Column,localhost:50053



------

