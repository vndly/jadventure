	
	var imageContainer     = null;
	var frameText          = null;
	var textContainer      = null;
	var currentImage       = null;
	var currentMusic       = null;
	var sceneArray         = null;
	var waitingClick       = false;
	var showAllText        = false;
	var loadingScene       = false;
	var audioType          = '';
	var currentUser        = '';
	var currentPass        = '';
	var currentAdventure   = '';
	var currentText        = '';
	var defaultFont        = '';
	var defaultSize        = '';
	var defaultColor       = '';
	var defaultAlign       = '';
	var defaultSpeed       = '';
	var sceneIndex         = 0;
	var defaultBlur        = 0;
	var defaultImageHeight = 0;
	var defaultTextHeight  = 0;
	
	function init(user, pass, adventure)
	{
		currentUser      = user;
		currentPass      = pass;
		currentAdventure = adventure;
		
		audioType = getAudioType();
		
		createElements();
		
		document.onclick = function()
		{
			if (waitingClick)
			{
				waitingClick = false;
				nextScene();
			}
		}
		
		document.oncontextmenu = function()
		{
			showAllText = true;
			
			return false;
		}
		
		document.ondragstart = function()
		{
			return false;
		}
		
		document.onselectstart = function()
		{
			return false;
		}
		
		document.oncopy = function()
		{
			document.selection.empty()
		}
		
		document.onbeforecopy = function()
		{
			return false;
		}
		
		sendChoice('');
	}
	
	function getAudioType()
	{
		var type  = 'ogg';
		var audio = new Audio();
		
		if (audio.canPlayType)
		{
			if (!!audio.canPlayType && "" != audio.canPlayType('audio/ogg; codecs="vorbis"'))
			{
				type = 'ogg';
			}
			else if (!!audio.canPlayType && "" != audio.canPlayType('audio/mpeg'))
			{
				type = 'mp3';
			}
		}
		
		return type;
	}
	
	function sendChoice(option)
	{
		showLoadingMessage();
		
		var parameters = new Parameters();
		parameters.add('user',      currentUser);
		parameters.add('pass',      currentPass);
		parameters.add('option',    option);
		parameters.add('adventure', currentAdventure);
		parameters.add('audioType', audioType);
		
		JConnection.send('php/server.php', processXML, failStart, parameters, JConnection.RESULT_TYPE_XML);
	}
	
	function failStart()
	{
		alert('FAIL LOADING SCENE');
	}
	
	function processXML(xml)
	{
		hideLoadingMessage();
		loadingScene = false;
		sceneIndex   = 0;
		sceneArray   = new Array();
		
		defaultFont  = getAttribute(xml, 'font');
		defaultSize  = getAttribute(xml, 'size');
		defaultColor = getAttribute(xml, 'color');
		defaultAlign = getAttribute(xml, 'align');
		defaultSpeed = getAttribute(xml, 'speed');
		defaultBlur  = getAttribute(xml, 'blur');
		
		var ratio = getAttribute(xml, 'ratio');
		defaultImageHeight = parseInt(document.body.clientHeight * parseFloat(ratio));
		defaultTextHeight  = parseInt(document.body.clientHeight - defaultImageHeight);
		
		updateContainers(defaultImageHeight);
		
		for (var index = 0; index < xml.childNodes.length; index++)
		{
			sceneArray.push(xml.childNodes[index]);
		}
		
		processScene();
	}
	
	function nextScene(delay)
	{
		if (delay)
		{
			setTimeout(processScene, parseInt(delay));
		}
		else
		{
			setTimeout(processScene, 1);
		}
	}
	
	function processScene()
	{
		if (sceneIndex < sceneArray.length)
		{		
			var element = sceneArray[sceneIndex++];
			
			if (element.nodeName == 'music')
			{
				processMusic(element);
			}
			else if (element.nodeName == 'image')
			{
				processImage(element);
			}
			else if (element.nodeName == 'sound')
			{
				processSound(element);
			}
			else if (element.nodeName == 'text')
			{
				processText(element);
			}
			else if (element.nodeName == 'choice')
			{
				processChoice(element);
			}
			else if (element.nodeName == 'font')
			{
				processFont(element);
			}
			else if (element.nodeName == 'jump')
			{
				processJump(element);
			}
		}
	}
	
	function getAttribute(element, name, decode)
	{
		var value = '';
		
		for (var index = 0; index < element.attributes.length; index++)
		{
			var attribute = element.attributes[index];
			
			if (attribute.nodeName == name)
			{
				if (decode)
				{
					value = decodeURIComponent(attribute.nodeValue);
				}
				else
				{
					value = attribute.nodeValue;
				}
					
				break;
			}
		}
		
		return value;
	}
	
	function processMusic(node)
	{
		var data  = getAttribute(node, 'data');
		var loop  = getAttribute(node, 'loop');
		var delay = getAttribute(node, 'delay');
		var clear = getAttribute(node, 'clear');
		
		if (clear == 'true')
		{
			removeAllChildrens(textContainer);
		}
		
		playMusic(data, (loop == 'true'));
		nextScene(delay);
	}
	
	function processImage(node)
	{
		var data   = getAttribute(node, 'data');
		var blur   = getAttribute(node, 'blur');
		var speed  = getAttribute(node, 'speed');
		var delay  = getAttribute(node, 'delay');
		var remove = getAttribute(node, 'remove');
		var height = getAttribute(node, 'height');
		var clear  = getAttribute(node, 'clear');
		
		if (clear == 'true')
		{
			removeAllChildrens(textContainer);
		}
		
		if (speed == '')
		{
			speed = defaultSpeed;
		}
		
		if (blur == '')
		{
			blur = defaultBlur;
		}
		
		if (height == '')
		{
			height = defaultImageHeight;
		}
		else
		{
			height = parseInt(document.body.clientHeight * parseFloat(height));
		}
		
		setImage(data, blur, speed, (remove == 'true'), height);
		nextScene(delay);
	}
	
	function processSound(node)
	{
		var data  = getAttribute(node, 'data');
		var wait  = getAttribute(node, 'wait');
		var delay = getAttribute(node, 'delay');
		var clear = getAttribute(node, 'clear');
		
		if (clear == 'true')
		{
			removeAllChildrens(textContainer);
		}
		
		if ((wait != '') && (wait > 0))
		{
			setTimeout(playSound.bind(data), wait);
		}
		else
		{
			playSound(data);
		}
		
		nextScene(delay);
	}
	
	Function.prototype.bind = function()
	{
		var that = this;
		var args = new Array();
		
		for (var i = 0; i < arguments.length; i++)
		{
			args.push(arguments[i]);
		}
		
		return function()
		{
			return that.apply(that, args);
		}
	}
	
	function processText(node)
	{
		var data   = getAttribute(node, 'data', true);
		var font   = getAttribute(node, 'font');
		var size   = getAttribute(node, 'size');
		var color  = getAttribute(node, 'color');
		var align  = getAttribute(node, 'align');
		var blur   = getAttribute(node, 'blur');
		var speed  = getAttribute(node, 'speed');
		var wait   = getAttribute(node, 'wait');
		var clear  = getAttribute(node, 'clear');
		var height = getAttribute(node, 'height');
		
		if (font == '')
		{
			font = defaultFont;
		}
		
		if (size == '')
		{
			size = defaultSize;
		}
		
		if (color == '')
		{
			color = defaultColor;
		}
		
		if (align == '')
		{
			align = defaultAlign;
		}
		
		if (speed == '')
		{
			speed = defaultSpeed;
		}
			
		if (blur == '')
		{
			blur = defaultBlur;
		}
		
		if (clear == 'true')
		{
			removeAllChildrens(textContainer);
		}
		
		if (height == '')
		{
			height = defaultTextHeight;
		}
		else
		{
			height = parseInt(document.body.clientHeight * parseFloat(height));
		}
		
		if ((wait != '') && (wait > 0))
		{
			setTimeout(setText.bind(data, font, size, color, align, speed, blur, height), wait);			
		}
		else
		{
			setText(data, font, size, color, align, speed, blur, height);
		}
	}
	
	function processJump(node)
	{
		var target = getAttribute(node, 'target');
		
		sendChoice(target);
	}
	
	function processFont(node)
	{
		var name  = getAttribute(node, 'name');
		var data  = getAttribute(node, 'data');
		
		addFont(name, data);
		nextScene();
	}
	
	function processChoice(node)
	{
		textContainer.style.opacity = 0;
		
		removeAllChildrens(textContainer);
		createTitle(node);
		
		var over  = getAttribute(node, 'over');
		var blur  = getAttribute(node, 'blur');
		var speed = getAttribute(node, 'speed');
		
		for (var index = 0; index < node.childNodes.length; index++)
		{
			processOption(node.childNodes[index], over);
		}
		
		setTimeout(processChoiceStep.bind(0, parseFloat(blur), parseInt(speed)), speed);
	}
	
	function processChoiceStep(alpha, blur, speed)
	{
		if (alpha <= 1)
		{
			textContainer.style.opacity = alpha;
			setTimeout(processChoiceStep.bind((alpha + blur), blur, speed), speed);
		}
	}
	
	function createTitle(node)
	{
		var data  = getAttribute(node, 'data', true);
		var font  = getAttribute(node, 'font');
		var size  = getAttribute(node, 'size');
		var color = getAttribute(node, 'color');
		
		if (font == '')
		{
			font = defaultFont;
		}
		
		if (size == '')
		{
			size = defaultSize;
		}
		
		if (color == '')
		{
			color = defaultColor;
		}
		
		if (data != '')
		{
			var title = document.createElement('div');
			title.style.paddingTop      = 0;
			title.style.paddingLeft     = 5;
			title.style.paddingBottom   = 10;
			title.style.backgroundColor = '#000000';
			title.style.fontFamily      = font;
			title.style.fontSize        = size;
			title.style.color           = color;
			
			title.appendChild(document.createTextNode(data));
			textContainer.appendChild(title);
		}
	}
	
	function processOption(node, over)
	{
		var data   = getAttribute(node, 'data', true);
		var font   = getAttribute(node, 'font');
		var size   = getAttribute(node, 'size');
		var color  = getAttribute(node, 'color');
		var target = getAttribute(node, 'target');
		
		if (font == '')
		{
			font = defaultFont;
		}
		
		if (size == '')
		{
			size = defaultSize;
		}
		
		if (color == '')
		{
			color = defaultColor;
		}
		
		createOption(data, font, size, color, over, target);
	}
	
	function createOption(text, font, size, color, over, target, title)
	{
		var option = document.createElement('div');
		option.style.paddingTop      = 5;
		option.style.paddingLeft     = 5;
		option.style.paddingBottom   = 5;
		option.style.backgroundColor = '#000000';
		option.style.fontFamily      = font;
		option.style.fontSize        = size;
		option.style.color           = color;
		option.style.cursor          = 'hand';
		option.style.cursor          = 'pointer';
		
		option.onmouseover = function()
		{
			if (!loadingScene)
			{
				option.style.color = over;
			}
		}
		
		option.onmouseout = function()
		{
			if (!loadingScene)
			{
				option.style.color = color;
			}
		}
		
		option.onclick = function()
		{
			if (!loadingScene)
			{
				loadingScene = true;
				sendChoice(target);
			}
		}
		
		option.appendChild(document.createTextNode(text));
		textContainer.appendChild(option);
	}
	
	function createElements()
	{
		getBody().style.overflow = 'hidden';
		
		createImageContainer();
		createTextContainer();
		createLoadingMessage();
	}
	
	function showLoadingMessage()
	{
		loadingMessage.style.visibility = 'visible';
	}
	
	function hideLoadingMessage()
	{
		loadingMessage.style.visibility = 'hidden';
	}
	
	function createLoadingMessage()
	{
		loadingMessage = document.createElement('div');
		loadingMessage.style.position    = 'absolute';
		loadingMessage.style.width       = 115;
		loadingMessage.style.height      = 25;
		loadingMessage.style.top         = (document.body.clientHeight/2) - (parseInt(loadingMessage.style.height)/2);
		loadingMessage.style.left        = (document.body.clientWidth/2)  - (parseInt(loadingMessage.style.width)/2);
		loadingMessage.style.paddingLeft = 40;
		loadingMessage.style.paddingTop  = 7;
		loadingMessage.style.borderStyle = 'outset';
		loadingMessage.style.fontFamily  = 'Verdana';
		loadingMessage.style.fontSize    = '16px';
		loadingMessage.style.fontWeight  = 'bold';
		loadingMessage.style.cursor      = 'default';
		loadingMessage.style.backgroundColor = '#FFFFFF';
		
		var loadingImage = document.createElement('img');
		loadingImage.src = 'img/loading.gif';
		loadingImage.style.position = 'absolute';
		loadingImage.style.top      = 0;
		loadingImage.style.left     = 0;
		
		loadingMessage.appendChild(loadingImage);
		loadingMessage.appendChild(document.createTextNode('Loading...'));
		
		getBody().appendChild(loadingMessage);
	}
	
	function updateContainers(imageHeight)
	{
		imageContainer.style.height = parseInt(imageHeight);
		
		frameText.style.height = document.body.clientHeight - parseInt(imageContainer.style.height) - parseInt(frameText.style.paddingTop) - parseInt(frameText.style.paddingBottom);
		frameText.style.top    = parseInt(imageContainer.style.height);
	}
	
	function createImageContainer()
	{
		imageContainer = document.createElement('div');
		imageContainer.style.position = 'absolute';
		imageContainer.style.top      = 0;
		imageContainer.style.left     = 0;
		imageContainer.style.width    = document.body.clientWidth;
		imageContainer.style.height   = parseInt(document.body.clientHeight * 0.8);
		imageContainer.style.backgroundColor = '#000000';
		
		getBody().appendChild(imageContainer);
	}
	
	function createTextContainer()
	{
		frameText = document.createElement('div');
		frameText.style.position        = 'absolute';
		frameText.style.paddingTop      = 0;
		frameText.style.paddingLeft     = 15;
		frameText.style.paddingRight    = 15;
		frameText.style.paddingBottom   = 0;
		frameText.style.float           = 'left';
		frameText.style.width           = document.body.clientWidth  - parseInt(frameText.style.paddingLeft) - parseInt(frameText.style.paddingRight);
		frameText.style.height          = document.body.clientHeight - parseInt(imageContainer.style.height) - parseInt(frameText.style.paddingTop) - parseInt(frameText.style.paddingBottom);
		frameText.style.top             = parseInt(imageContainer.style.height);
		frameText.style.left            = 0;
		frameText.style.backgroundColor = '#000000';
		
		textContainer = document.createElement('pre');
		textContainer.style.marginTop  = 10;
		textContainer.style.whiteSpace = 'pre-line';
		textContainer.style.color      = '#FFFFFF';
		textContainer.style.cursor     = 'default';
		
		frameText.appendChild(textContainer);		
		getBody().appendChild(frameText);
		
		return parseInt(frameText.style.height);
	}
	
	function playMusic(data, loop)
	{
		var newMusic = createSound(data, loop);
		
		if (currentMusic != null)
		{
			if (newMusic.src != currentMusic.src)
			{
				if (!currentMusic.paused)
				{
					currentMusic.pause();
				}
				
				currentMusic = newMusic;
			}
			else
			{
				if (currentMusic.paused)
				{
					currentMusic.play();
				}
			}
		}
		else
		{
			currentMusic = newMusic;
		}
	}
	
	function playSound(data)
	{
		createSound(data, false);
	}
	
	function setText(text, font, size, color, align, speed, blur, height)
	{
		showAllText = false;
		currentText = text;
		textContainer.style.fontFamily = font;
		textContainer.style.fontSize   = size;
		textContainer.style.color      = color;
		textContainer.style.textAlign  = align;
		
		updateContainers(parseInt(document.body.clientHeight - height));
		
		if (blur != '')
		{
			textContainer.style.opacity = 0;
			removeAllChildrens(textContainer);
			textContainer.appendChild(document.createTextNode(currentText));						
			setTextStepBlur(0, parseFloat(blur), speed);
		}
		else
		{
			setTextStepSpeed(0, speed);
		}
	}
	
	function setTextStepBlur(alpha, blur, speed)
	{
		if (alpha <= 1)
		{
			if (showAllText)
			{
				alpha = 1;
			}
			
			textContainer.style.opacity = alpha;
			setTimeout(setTextStepBlur.bind((alpha + blur), blur, speed), speed);
		}
		else
		{
			showAllText  = false;
			waitingClick = true;
		}
	}
	
	function removeAllChildrens(element)
	{
		while (element.hasChildNodes())
		{
			element.removeChild(element.lastChild);
		}
	}
	
	function setTextStepSpeed(textIndex, speed)
	{
		if (textIndex <= currentText.length)
		{
			if (showAllText)
			{
				textIndex = currentText.length;
			}
			
			removeAllChildrens(textContainer);
			textContainer.appendChild(document.createTextNode(currentText.substr(0, textIndex)));
			setTimeout(setTextStepSpeed.bind((textIndex + 1), speed), speed);
		}
		else
		{
			showAllText  = false;
			waitingClick = true;
		}
	}
	
	function removeLastImage()
	{
		while (imageContainer.childNodes.length > 1)
		{
			imageContainer.removeChild(imageContainer.childNodes[0]);
		}
	}
	
	function setImageStep(alpha, blur, speed)
	{
		if (alpha <= 1)
		{
			currentImage.style.opacity = alpha;
			setTimeout(setImageStep.bind((alpha + blur), blur, speed), speed);
		}
		else
		{
			removeLastImage();
		}
	}
	
	function setImage(data, blur, speed, removeLast, height)
	{
		if (removeLast)
		{
			removeAllChildrens(imageContainer);
		}
		
		currentImage = createImage(data);
		imageContainer.appendChild(currentImage);
		updateContainers(height);
		
		if (blur != '')
		{
			setImageStep(0, parseFloat(blur), speed);
		}
		else
		{
			removeLastImage();
		}
	}
	
	function getBody()
	{
		return document.getElementsByTagName('body')[0];
	}
	
	function createSound(data, loop)
	{
		var sound  = new Audio();
		sound.src  = 'data:audio/' + audioType + ';base64,' + data;
		sound.loop = loop;
		sound.play();
		
		return sound;
	}
	
	function createImage(data)
	{
		var image = new Image();
		image.src = 'data:image/jpg;base64,' + data;
		image.style.position = 'absolute';
		image.style.left   = 0;
		image.style.top    = 0;
		image.style.width  = '100%';
		image.style.height = '100%';
		
		return image;
	}
	
	function addFont(name, data)
	{
		var css = document.createElement('style');
		css.textContent = "@font-face { font-family: " + name + "; src: url('data:font/ttf;base64," + data + "'); }";
		document.getElementsByTagName('head')[0].appendChild(css);    
	}