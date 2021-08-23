cd server
export FLASK_APP=app
flash run &
chromium-browser --kiosk --fullscreen http://localhost:5000/index.html  