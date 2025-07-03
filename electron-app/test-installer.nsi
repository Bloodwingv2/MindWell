!include LogicLib.nsh
!include "MUI2.nsh"

OutFile "TestInstaller.exe"
InstallDir "$PROGRAMFILES\TestApp"
Page custom CustomPageShow CustomPageLeave
Page instfiles

Var installOllama
Var checkboxControl

Section "MainSection"
  ${If} $installOllama == "1"
    MessageBox MB_OK "User selected to install Ollama"
  ${Else}
    MessageBox MB_OK "User skipped Ollama"
  ${EndIf}
SectionEnd

Function CustomPageShow
  nsDialogs::Create 1018
  Pop $0

  ${NSD_CreateCheckbox} 0 50u 100% 12u "Install Ollama locally (Recommended)"
  Pop $checkboxControl
  ${NSD_SetState} $checkboxControl ${BST_CHECKED}

  nsDialogs::Show
FunctionEnd

Function CustomPageLeave
  ${NSD_GetState} $checkboxControl $installOllama
FunctionEnd
