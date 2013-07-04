<?php
	
	function writeData($file, $data)
	{
		$file  = fopen($file, 'w');
		$empty = true;
		
		foreach ($data as $name => $value)
		{
			if (!$empty)
			{
				fwrite($file, "\r\n" . "\r\n");
			}
			
			fwrite($file, '[' . $name . ']');
			
			foreach ($value as $field_name => $field_value)
			{
				fwrite($file, "\r\n" . $field_name  . ' = ' . $field_value);
			}
			
			$empty = false;
		}
		
		fclose($file);
	}
	
	function readData($file)
	{
		return parse_ini_file($file, true);
	}
	
	function validUser($user, $pass)
	{
		$data = readData('../usr/users.ini');
		
		return ($data['users'][$user] == $pass);
	}
	
	function getLanguage()
	{
		$languages = array('en', 'es');
		
		$result = strtolower(substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2));
		
		if (!in_array($result, $languages))
		{
			$result = $languages[0];
		}
		
		//TODO
		$result = 'en';
		
		return $result;
	}
	
	function getScene($scenes, $id)
	{
		$result = null;
		
		foreach ($scenes->scene as $scene)
		{
			if (((string)$scene['id']) == $id)
			{
				$result = $scene;
			}
		}
		
		return $result;
	}
	
	function getFonts($fonts, $adventure)
	{
		$result = '';
		
		foreach ($fonts->font as $font)
		{
			$result .= "<font name='" . ((string)$font['name']) . "' data='" . getData('font', (string)$font['data'], $adventure, '') . "' />";
		}
		
		return $result;
	}
	
	function getSceneBranch($branches, $id)
	{
		$result = null;
		
		foreach ($branches->scene as $scene)
		{
			if (((string)$scene['id']) == $id)
			{
				$result = $scene;
			}
		}
		
		return $result;
	}
	
	function getTarget($scene, $option)
	{
		$result = '';
		
		foreach ($scene->branch as $branch)
		{
			if (((string)$branch['option']) == $option)
			{
				$result = (string)$branch['id'];
			}
		}
		
		return $result;
	}
	
	function showScene($scene, $fonts, $adventure, $audioType)
	{
		$xml  = "<?xml version='1.0' encoding='UTF-8'?>";
		$xml .= getNode('scene', $scene, $fonts, $adventure, $audioType);
		
		echo $xml;
	}
	
	function getNode($name, $node, $fonts, $adventure, $audioType)
	{
		$result = '';
		
		if (count($node) > 0)
		{
			$result .= getHead($name, $node, $adventure, $audioType);
			$result .= $fonts;
			
			foreach ($node as $class => $value)
			{
				$result .= getNode($class, $value, '', $adventure, $audioType);
			}
			
			$result .= "</" . $name . ">";
		}
		else
		{
			$result .= getLine($name, $node, $adventure, $audioType);
		}
		
		return $result;
	}
	
	function getHead($type, $element, $adventure, $audioType)
	{
		$head .= "<" . $type;
		
		foreach ($element->attributes() as $class => $value)
		{
			if ($class == 'data')
			{
				$head .= " " . $class . "='" . getData($type, (string)$value, $adventure, $audioType) . "'";
			}
			else if ($class != 'id')
			{
				$head .= " " . $class . "='" . $value . "'";
			}
		}
		
		$head .= ">";
		
		return $head;
	}
	
	function getLine($type, $element, $adventure, $audioType)
	{
		$line .= "<" . $type;
		
		foreach ($element->attributes() as $class => $value)
		{
			if ($class == 'data')
			{
				$line .= " " . $class . "='" . getData($type, (string)$value, $adventure, $audioType) . "'";
			}
			else
			{
				$line .= " " . $class . "='" . $value . "'";
			}
		}
		
		$line .= " />";
		
		return $line;
	}
	
	function getExtension($type, $audioType)
	{
		$result = '';
		
		if (($type == 'text') || ($type == 'choice') || ($type == 'option'))
		{
			$result = '.txt';
		}
		else if ($type == 'image')
		{
			$result = '.jpg';
		}
		else if (($type == 'music') ||($type == 'sound'))
		{
			$result = '.' . $audioType;
		}
		else if ($type == 'font')
		{
			$result = '.ttf';
		}
		
		return $result;
	}
	
	function getPathBase($type, $adventure)
	{
		$result = '';
		
		if (($type == 'text') || ($type == 'choice') || ($type == 'option'))
		{
			$result = '../bin/' . $adventure . '/txt/';
		}
		else if ($type == 'image')
		{
			$result = '../bin/' . $adventure . '/img/';
		}
		else if ($type == 'music')
		{
			$result = '../bin/' . $adventure . '/msc/';
		}
		else if ($type == 'sound')
		{
			$result = '../bin/' . $adventure . '/snd/';
		}
		else if ($type == 'font')
		{
			$result = '../bin/' . $adventure . '/fnt/';
		}
		
		return $result;
	}
	
	function getPathDefault($type, $name, $adventure)
	{
		return getPathBase($type, $adventure) . $name;
	}
	
	function getPathLanguage($type, $name, $adventure)
	{
		return getPathBase($type, $adventure) . getLanguage() . '/' . $name;
	}
	
	function getData($type, $name, $adventure, $audioType)
	{
		$result = '';
		
		$extension = getExtension($type, $audioType);
		$path_default  = getPathDefault($type, $name, $adventure) . $extension;
		$path_language = getPathLanguage($type, $name, $adventure) . $extension;
		
		if (file_exists($path_language))
		{
			$result = file_get_contents($path_language);
		}
		else
		{
			$result = file_get_contents($path_default);
		}
		
		if (($type == 'text') || ($type == 'choice') || ($type == 'option'))
		{
			$result = rawurlencode($result);
		}
		else
		{
			$result = base64_encode($result);
		}
		
		return $result;
	}
	
	$user      = $_POST['user'];
	$pass      = $_POST['pass'];
	$option    = $_POST['option'];
	$adventure = $_POST['adventure'];
	$audioType = $_POST['audioType'];
	
	if (validUser($user, $pass))
	{
		$sceneResult = null;
		$fonts = '';
		$userFile  = '../usr/' . $user . '.ini';
		$data = readData($userFile);
		$xml  = simplexml_load_file('../bin/' . $adventure . '/xml/xml.xml');
		$lastScene = $data['adventures'][$adventure];
		
		if ($option == '')
		{
			$sceneResult = getScene($xml->scenes, $lastScene);
			$fonts = getFonts($xml->fonts, $adventure);
		}
		else
		{
			$scene = getSceneBranch($xml->branches, $lastScene);
			$targetId = getTarget($scene, $option);
			$sceneResult = getScene($xml->scenes, $targetId);
			$data['adventures'][$adventure] = $targetId;
			writeData($userFile, $data);
		}
		
		showScene($sceneResult, $fonts, $adventure, $audioType);
	}
?>