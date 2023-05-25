@ECHO OFF
title Bot Launcher
cls
:boot
node index.js --debug
echo.
set proceed=""
:choice
set /p proceed=Restart? (y/n):
if "%proceed%"=="Y" goto boot
if "%proceed%"=="н" goto boot
if "%proceed%"=="y" goto boot
if "%proceed%"=="n" exit
if "%proceed%"=="т" exit
if "%proceed%"=="N" exit
goto choice
