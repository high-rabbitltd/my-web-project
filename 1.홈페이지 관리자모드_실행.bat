@echo off
echo ==========================================
echo Starting High Rabbit Admin Server...
echo ==========================================
echo.
echo [1/3] Installing required packages...
python -m pip install flask beautifulsoup4

echo [2/3] Opening web browser...
start http://127.0.0.1:5000

echo [3/3] Starting the local server...
echo Please KEEP THIS WINDOW OPEN while editing!
echo.
python admin_server.py
pause
