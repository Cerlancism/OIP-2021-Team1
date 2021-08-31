cd server
export FLASK_APP=app
flask run --host=0.0.0.0 &
export DISPLAY=:0
chromium-browser --kiosk --fullscreen http://localhost:5000/index.html  
