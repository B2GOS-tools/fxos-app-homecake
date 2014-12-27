(function() {

var parallax = false;
var hideOnScroll = false;
var favs = [
	'Camera',
	'Settings',
	'Phone',
	'Music',
];
var mode = 1;
const LAST_MODE = 3;
var apps = document.getElementById('apps');
var bottom = document.getElementById('bottom');
var topbar = document.getElementById('topbar');
var input = document.getElementById('input');
var iconsize = 64;
var iconHash = {};
var writing = false;

function bottomVisibility(str) {
	if (bottom) bottom.style.visibility = str;
}

function topbarVisibility(str) {
	if (topbar) topbar.style.visibility = str;
}

function useMode (m) {
	if (m == -1) {
		mode ++;
		if (mode==LAST_MODE)
			mode = 0;
	} else {
		mode = m;
	}
	var body = document.getElementById('body');

	switch (mode) {
	case 0:
		iconsize = window.innerWidth-16;
		bottomVisibility ('hidden');
		toggle.innerHTML = "&nbsp;=&nbsp;";
		body.style ="";
		break;
	case 1:
		iconsize = 64;
		bottomVisibility ('visible');
		body.style ="width:1024px !important";
		toggle.innerHTML = "&nbsp;::&nbsp;";
		break;
	case 2:
		iconsize = 64;
		body.style ="";
		bottomVisibility ('visible');
		toggle.innerHTML = "&nbsp;+&nbsp;";
		break;
	}
	updateApps();
	updateFavs();
}
useMode (mode);

function addFav(name) {
	if (favs.indexOf (name) != -1)
		return;
	var newfavs = [name];
	for (i=0;i<Math.min (favs.length,3);i++) {
		newfavs[newfavs.length] = favs[i];
	}
	favs = newfavs;
	updateFavs ();
}

/*
	const HIDDEN_ROLES = ['system', 'input', 'homescreen'];

	function populate() {
		let icons = document.querySelector("#icons");
		let appMgr = navigator.mozApps.mgmt;
		appMgr.getAll().onsuccess = function(event) {
			let apps = event.target.result;
			let fragment = document.createDocumentFragment();
			for (let app of apps) {
				if (HIDDEN_ROLES.indexOf(app.manifest.role) > -1)
					continue
					if (app.manifest.entry_points) {
						for (let k in app.manifest.entry_points) {
							fragment.appendChild(createIcon(app, k));
						}
					} else {
						fragment.appendChild(createIcon(app));
					}
			}
			icons.innerHTML = "";
			icons.appendChild(fragment);
		}
	}
*/

	function updateWallpaper() {
		var req = navigator.mozSettings.createLock().get('wallpaper.image');
		req.onsuccess = function onsuccess() {
			var blob = req.result['wallpaper.image'];
			var url = URL.createObjectURL(blob);
			var wallpaper = document.getElementById('wallpaper')
			wallpaper.style['background-color'] = '#101010';
			wallpaper.style.backgroundImage = "url(" + url + ")";
		}
	}

	var icons = [];

	var running = false;
	function updateAppCache (app) {
		icons = [];
		input.value = "";
		FxosApps.all().then(icns => {
			icns.forEach(icon => {
				var min = Math.min (icns.length, 6);
				icons[icons.length] = icon;
			})
		}) .then (foo=> {
			updateFavs();
			updateApps();
		});
	}

	function updateFavs() {
		var str = "";
		for (var idx in icons) {
			var icon = icons[idx];
			if (favs.indexOf (icon.name) != -1)
				str += renderFav (icon);
		}
		bottom.innerHTML = "<center>"+str+"</center>";
	}

	function updateApps() {
		var filter = input.value;
		if (input.value.length<1) filter = "";
		var str = "";
		//apps.innerHTML = "";
		firstResult = null;
		for (var idx in icons) {
			var icon = icons[idx];
			if (filter=="" || icon.name.toLowerCase().indexOf (filter.toLowerCase()) != -1) {
				if (!firstResult)
					firstResult = icon;
				str += renderApp (icon);
			}
		}
		apps.innerHTML = str;
		if (!hideOnScroll && input.value == "")
			apps.innerHTML += "<div style='height:80px'></div>";
	}

	var firstResult = null;
	window.addEventListener("DOMContentLoaded", () => {
		apps = document.getElementById('apps');
		bottom = document.getElementById('bottom');
		topbar = document.getElementById('topbar');
		input = document.getElementById('input');
		toggle = document.getElementById('toggle');
		input.value = "";
		writing = false;
		input.onkeyup = function(e) {
			if (e.keyCode==13) {
				var text = input.value;
				if (firstResult)
					firstResult.launch();
			} else {
				updateApps();
			}
// on enter execute the first result?
		}
		var odelta = 0;
		window.addEventListener ("scroll", function() {
			if (parallax) {
				var wh = document.body.height; // document size
				var y = document.body.scrollTop; // screen offset
				var h = document.body.clientHeight; // screen size
				wh = 8500;
				var miny = 0;
				var maxy = 1024 - h; // h-wh;

				var delta = maxy * (y / wh); //(maxy - y);
				console.log(maxy, wh,y,h, "=", delta);
				// parallax
				if (delta != odelta) {
					document.getElementById('wallpaper').style['background-position'] = "0px -"+delta+"px";
				}
			} 
			var focused = document.activeElement;
			if (!focused || focused == document.body)
				focused = null;
			else if (document.querySelector)
				focused = document.querySelector(":focus");
			if (focused != input) {
				var y = document.body.scrollTop; // screen offset
				if (y > odelta) {
					// scrolldown
					if (y+16>odelta) {
						topbarVisibility ('hidden');
						if (hideOnScroll)
							bottomVisibility ('hidden');
					}
				} else {
					// scrollup
					if (y+16<odelta) {
						topbarVisibility ('visible');
						if (mode != 0) {
							bottomVisibility ('visible');
						}
					}
				}
				odelta = y;
			}
		}, true);
		document.body.onfocus = function () {
			writing = false;
		}
		input.onfocus = function () {
			writing = true;
			bottom.style['visibility'] = 'hidden';
			toggle.innerHTML="&nbsp;-&nbsp;";
		}
		input.onblur = function () {
			if (mode)
				bottom.style['visibility'] = 'visible';
			switch (mode) {
			case 0: toggle.innerHTML="&nbsp;=&nbsp;"; break;
			case 1: toggle.innerHTML="&nbsp;::&nbsp;"; break;
			case 2: toggle.innerHTML="&nbsp;+&nbsp;"; break;
			}
		}
		toggle.onclick = function () {
			if (mode == 0) {
				if (bottom) bottom.style.visibility = 'hidden';
			}
			if (writing) { // this.innerHTML.indexOf("-") != -1) {
				writing = false;
			} else {
				useMode (-1); 
			}
			document.body.focus ();
		}

		var appMgr = navigator.mozApps.mgmt;
appMgr.addEventListener("install", function (event) {
console.log(event.application);
//updateAppCache();
});
appMgr.addEventListener("uninstall", function (event) {
console.log(event.application);
updateAppCache();
});

		navigator.mozSettings.addObserver('wallpaper.image', updateWallpaper);
		updateWallpaper();
		updateAppCache();
	}, true);

	function renderFav(icon) {
		iconHash[icon.icon] = icon;
		return '<div class="bottom-tile"><img width="'+iconsize+'px" height="'+iconsize+ 'px" src="'+icon.icon+'" /></div>';
	}

	function renderApp(icon) {
		var str = '<img width="'+iconsize+'px" height="'+iconsize+ 'px" alt="..?.." src="'+icon.icon+'" />';
		var style='';
		switch (mode) {
		case 0:
			//str += '&nbsp;&nbsp;</a><br />';
			str += '&nbsp;&nbsp;<br />';
			break;
		case 2:
			style = "style='display:inline-block'";
			break;
		case 1:
			str += '&nbsp;&nbsp;'+icon.name+'<br />'; //'</a><br />';
			break;
		}
		iconHash[icon.icon] = icon;
		return "<div class=tile "+style+">"+str+"</div>";
	}

	var opened = [];

	window.addEventListener('click', function(e) {
		var icon = undefined;
		var container = e.target
		if (container.src) {
			icon = iconHash[container.src];
		} else {
			container = container.childNodes[0];
			if (container && container.src) {
				icon = iconHash[container.src];
			} else {
				/* unknown stuff clicked , just ignore */
			}
		}
		if (icon) {
			document.body.focus ();
			writing = false;
			running = true;
			icon.launch();
			addFav(icon.name);
		}
	});
      window.addEventListener('hashchange', function() {
	      /* Home button is pressed */
	      if (running) {
		      running = false;
		      return;
	      }
	      var needs_update = input.value != "";
	      input.value = "";
	      input.blur ();
	      topbarVisibility ('visible');
	      if (mode != 0) {
		      bottomVisibility ('visible');
	      }
	      if (needs_update) {
		      updateApps();
		      document.body.scrollTo (0,0);
	      }
	      return false;
      });
}());
