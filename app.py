from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
#Initalizing SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def home():
    print("SERVER STARTED")
    return render_template('face_detection.html')

 #Creating a SocketIO connetion named connect to initially test connection
@socketio.on('connect')
def test_connect():
    print("SOCKET CONNECTED")
    
#Creating a socket named detections to get data of the inference
@socketio.on('detections')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: '+ str(json))

if __name__ == '__main__':
#Joining the socket to the App   
    socketio.run(app)