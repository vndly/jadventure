JAdventure
==========

JAdventure is a JavaScript/PHP adventure video game framework. The user just needs to create an XML file that defines the story flow and place all the media files (texts, images, sounds, music and fonts) into the specific folder. The engine will display the texts, images and audio defined in the story and the user will take different decisions that will take him through different stories.

Demo
----

[SHORT STORY DEMO](http://zeronest.com/games/adventure)

Folder structure
----------------

* story_name
	+ fnt (text fonts)
	+ img (images)
	+ msc (music)
	+ snd (sounds)
	+ txt (texts)
	+ xml (story script)

Languages
---------

The engine supports multiple languages for each story. For that, the user needs to create a folder for each language that he wants to offer. For example:

* txt
	+ en (texts in English)
	+ es (texts in Spanish)
	+ fr (texts in French)

Effects
-------

The user can define different effects:

* For texts:
	+ Text font
	+ Text size
	+ Text color
	+ Text align
	+ Text speed
	+ Text blur
* For sounds:
	+ Delay
* For music:
	+ Loop
	+ Delay
* For images:
	+ Blur
	+ Size
	+ Delay

Supported Browsers
------------------

* Google Chrome
* Mozilla Firefox
* Opera
* Safari
* Internet Explorer