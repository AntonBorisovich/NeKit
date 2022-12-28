@echo off
title language select
set lang = en

cls

echo.
echo == Language
echo.
echo  (1) English
echo  (2) Russian (Русский)
echo.
choice /C 12
if "%ERRORLEVEL%"=="2" set lang = ru

goto step1_%lang%

:step1_ru
echo not done yet. press any key to proceed with english language
pause>nul
set lang = en
goto step1_%lang%

:step1_en
echo.
echo ==== Welcome to NeKit configurator!
echo.
echo == Choose messanger for this folder or input yours
echo.
echo  (1) Discord
echo  (2) Telegram
echo  (3) Custom
echo.

choice /C 12
if "%ERRORLEVEL%"=="2" set mess = telegram
if "%ERRORLEVEL%"=="1" set mess = discord