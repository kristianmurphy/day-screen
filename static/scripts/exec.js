  ////////////////////
 /// Exec script  ///
////////////////////





  ////////////
 /// INIT ///
////////////

//// Start alarm box off and load default page ////
//toggleAlarms();


//// State ////    Make creating a layout work with grid and nested param ids, then keeping track of it here, then updating the cache and json!
window.appState = {
  layout: 0,
  version: 0,
  state: "viewing",
  data: {} // Save a copy of necessary param id's and values here to update in 1 single query, and read from in all the widgets
};

//// Load widget libary to widget-libary div (hidden) ////
loadWidgetLibrary();




  ////////////
 /// EXEC ///
////////////

//// Start alarm box off and load default page ////

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    document.getElementById("splash-screen").style.display = "none";
  }, 3000); // Make sure matches splash animation duration
});



//// Update time ////

setInterval(updateDateTime, 1000);


//// Edit buttons ////
document.getElementById('start-edit').addEventListener('click', openEdit);
document.getElementById('cancel-edit').addEventListener('click', closeButton);
document.getElementById('add-edit').addEventListener('click', openWidgetSelection);
document.getElementById('finish-edit').addEventListener('click', finishButton);




//// Check for layout cache update ////

let currentLayout = "engine_panel";
let version = 0;





  ////////////
 /// ANIM ///
////////////

document.addEventListener("DOMContentLoaded", () => {
  const hammerButton = document.getElementById("start-edit");
  const hammerIcon = hammerButton.querySelector("img");

  hammerButton.addEventListener("click", () => {
      // Add the animation class
      hammerIcon.classList.add("hammer-strike");

      // Remove the animation class after the animation ends
      hammerIcon.addEventListener("animationend", () => {
          hammerIcon.classList.remove("hammer-strike");
      }, { once: true }); // Ensure the listener is removed after one execution
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const settingsButton = document.getElementById("settings-button");
  const settingsIcon = settingsButton.querySelector("img");

  // Add click event listener for the settings button
  settingsButton.addEventListener("click", () => {
      // Add the animation class
      settingsIcon.classList.add("settings-rotate");

      // Remove the animation class after the animation ends
      settingsIcon.addEventListener("animationend", () => {
          settingsIcon.classList.remove("settings-rotate");
      }, { once: true }); // Ensure the listener is removed after one execution
  });
});



/* FIX
setInterval(async () => {
  let currentLayout = "";
  let version = 0;
  const res = await fetch(`/check-layout-update?layout_name=${currentLayout}&version=${version}`);
  const data = await res.json();

  if (data.update_required) {
    version = data.version;
    const layoutRes = await fetch(`/get-layout?layout_name=${currentLayout}`);
    const layout = await layoutRes.json();
    renderLayout(layout);
  }
}, 3000);
*/
