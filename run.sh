cd server
export FLASK_APP=app
flask run &
export DISPLAY=:0
chromium-browser --kiosk --fullscreen http://localhost:5000/index.html  