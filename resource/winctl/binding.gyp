{
	"targets": [
		{
			"target_name": "winctl",
			"sources": [
				"src/WinCtlWrap.cc",
				"src/WinCtlWindow.cc"
			],
			"include_dirs": [
				"<!(node -e \"require('nan')\")"
			]
		}
	]
}
