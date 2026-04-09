'''
Class for Debug logging

Suppress logs by setting disable = True
Do not add filename to be displayed
Custom Log messages in CMD 
'''
from typing import Optional
class Logger():
    def __init__(self,disable=False, file:Optional[str] = None):
        self.disable = disable
        self.filename = None
        if file:
            self.filename = file

    def log(self,header:str="INFO",message:str=""):
        if not self.disable and self.filename:
            print(f"{self.filename} --> [{header}] {message}")
        elif not self.disable and not self.filename: 
            print(f"[{header}] {message}")