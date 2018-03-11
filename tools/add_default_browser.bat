reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities" /v ApplicationDescription /t REG_SZ /d "Sushi Browser" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities" /v ApplicationName /t REG_SZ /d "Sushi" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities" /v ApplicationIcon /t REG_SZ /d "C:\Users\%username%\AppData\Local\sushi\sushi.exe,0" /f

reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities\FileAssociations" /v .htm /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities\FileAssociations" /v .html /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities\FileAssociations" /v .shtml /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities\FileAssociations" /v .xht /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities\FileAssociations" /v .xhtml /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities\FileAssociations" /v .webp /t REG_SZ /d "SushiURL" /f

reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities\URLAssociations" /v ftp /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities\URLAssociations" /v http /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Sushi\Capabilities\URLAssociations" /v https /t REG_SZ /d "SushiURL" /f


reg add "HKEY_LOCAL_MACHINE\SOFTWARE\RegisteredApplications" /v Sushi /t REG_SZ /d "Software\Sushi\Capabilities" /f

reg add "HKEY_LOCAL_MACHINE\Software\Classes\SushiURL" /t REG_SZ /d "Sushi Document" /f
reg add "HKEY_LOCAL_MACHINE\Software\Classes\SushiURL" /v FriendlyTypeName /t REG_SZ /d "Sushi Document" /f

reg add "HKEY_LOCAL_MACHINE\Software\Classes\SushiURL\shell\open\command" /t REG_SZ /d "\"C:\Users\%username%\AppData\Local\sushi\sushi.exe\" -- \"%%1\"" /f

pause