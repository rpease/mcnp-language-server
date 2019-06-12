# MCNP Language Server

A language server for Los Alamos' [Monte Carlo N-Particle (MCNP)](https://mcnp.lanl.gov/) Transport Code. The language server provides helpful feedback for developing MCNP input files. The features are intended to provide an IDE typical for more standard languages (i.e. Python, C++, etc.).

The project currently has client support for [Visual Studio Code](https://code.visualstudio.com/).

<a href="https://imgur.com/ZX7zHeo"><img src="https://i.imgur.com/ZX7zHeo.png" title="source: imgur.com" /></a>

## Features

- synatx highlighting

## Installation

- Edit VS Code User Settings
* For proper functionality and highlighting, your user settings will have to be edited.
	1. Open Settings
		* __Ctrl__+__,__
		or
		* File -> Preferences -> Settings
	2. Open User settings.json
		* In upper right corner of settings menu, click the __Open Settings (JSON)__ button
	3. Add the below settings
		"[mcnp]": {
			"editor.detectIndentation": false,
			"editor.tabSize":8
		}