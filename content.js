/**
* Author : TheMadSword @ GitHub
* Chrome extension intended for navigating https://www.languagesquad.com/ without mouse
*/

const contentScriptLinks = ['jquery.min.js'];

contentScriptLinks.forEach(src => {
  let el = document.createElement('script');
  el.src = chrome.runtime.getURL(src);
  document.body.appendChild(el);
});

(function(){

//0- Checks url + var (lol)
let url = window.location.toString();
if (!url.includes("languagesquad.com")) {
  console.log("Not language squad");
  return;
}

//Will be used for 11+ values (52)
const qwerty = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
if (qwerty.length !== 52) {
  console.warning("Only 52 letters ? wrote by mistake ?");
  return;
}

//#1 Add numbers

function is_valid_btn(btn) {
  if ($(btn).children === 0) {
    console.log("Weird, btn with no children entities found");
    return false;
  }
  return true;
}

function generate_string_to_add(idx) {
  if (idx < 10) { //allow 10 without "0" because it's obvious
    return (idx + 1).toString() + ". ";
  }

  return (idx + 1).toString() + " (" + qwerty[idx - 10] + ")" + ". ";
}

function number_buttons() {
  let btns = gameNode.find("button:not(.btn).sstestoption:visible");
  btns.each(function(idx, btn){
    if (!is_valid_btn(btn)) {
      return;
    }
    if (btn.getAttribute("numbered") === "") {
      return;
    }

    for (let i = 0; i < btn.children[0].childNodes.length; i++) {
      if (btn.children[0].childNodes[i].nodeType === 3) {
        btn.children[0].childNodes[i].before(generate_string_to_add(idx));
        btn.setAttribute("numbered", "");
        break;
      }
    }

  });
}

const gameNode = $("main#game");

number_buttons();

//#2 Bind keys
document.addEventListener('keyup', function(e) {
  if (e.altKey || e.ctrlKey)
    return;

  if (e.key.length === 1) { //Avoid 'Enter' triggering between A & Z
    if (e.key >= "0" && e.key <= "9") {
      click_shortcut(parseInt(e.key));
    } else if (e.key >= "a" && e.key <= "z" || e.key >= "A" && e.key <= "Z") {
      click_shortcut(qwerty.indexOf(e.key) + 11);
    }
  } else if (e.key === 'Enter') {
    press_enter();
  }
});

function click_shortcut(key) {
  if (key === 0) {
    key = 10;
  }
  let number_btns = $("button:not(.btn):visible[numbered]");
  if (number_btns[key - 1] == null) {
    console.log("btn# " + key + " not visible (=" + number_btns[key - 1] + ")");
    return;
  }
  number_btns[key - 1].click();
}

function press_enter() {
  if ($("button.btn-primary:visible:not(.btn-sm)").first().click().length !== 1) {
    $("button.btn-danger:visible:not(.btn-sm, .btn-block)").first().click();
  }
}

//3- Observer for page change
const config = { attributes: true, childList: false, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  let modified = false; //if 2 mutation in some loop for some reason
  for (const mutation of mutationList) {
    if (mutation.type === 'attributes' && mutation.attributeName === "style") {
      modified = true;
    }
  }
  if (modified) {
    number_buttons();
  }
};

const observer = new MutationObserver(callback);
observer.observe(gameNode[0], config);

})();
