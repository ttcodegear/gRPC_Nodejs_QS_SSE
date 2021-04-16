# gRPC_Nodejs_QS_SSE
C:\>node --version

  v12.21.0

C:\>npm install -g grpc-tools

C:\>npm list -g

  +-- grpc-tools@1.11.1

C:\>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:[protohub_path] --grpc_out=grpc_js:[grpc_path] proto_file_path

C:\>dir *_pb*

  xxxx_pb.js

  xxxx_grpc_pb.js





C:\>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=grpc_js:./ ./helloworld.proto

C:\>npm install @grpc/proto-loader google-protobuf @grpc/grpc-js

C:\>node greeter_server.js

C:\>node greeter_client.js





C:\>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=grpc_js:./ ./hellostreamingworld.proto

C:\>npm install @grpc/proto-loader google-protobuf @grpc/grpc-js

C:\>node greeter_stream_server.js

C:\>node greeter_stream_client.js





C:\>openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 3650 -out server.crt

C:\>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=grpc_js:./ ./helloworld.proto

C:\>npm install @grpc/proto-loader google-protobuf @grpc/grpc-js

C:\>node greeter_ssl_server.js

C:\>node greeter_ssl_client.js





C:\>grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=grpc_js:./ ./ServerSideExtension.proto

C:\>npm install @grpc/proto-loader google-protobuf @grpc/grpc-js undercore

C:\>node SSE_Example.js



C:\Users\[user]\Documents\Qlik\Sense\Settings.ini

------

[Settings 7]

SSEPlugin=Column,localhost:50053



------

