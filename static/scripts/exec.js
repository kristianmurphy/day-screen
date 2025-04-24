
toggleAlarms();
loadPage(0, "")

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.getElementById("splash-screen").style.display = "none";
    }, 3000); // Make sure matches splash animation duration
});

// Update immediately and then every second
updateDateTime();
setInterval(updateDateTime, 1000);
setInterval(() => {
    if (!state.isLoading) {
        alarm_test();
        loadPage(state.page, state.subsystem);
    }
}, 2000);

const categories = document.querySelectorAll('.category');
var cur_subsystem = "";

//setTimeout(() => duplicateElement("prototype-data", 5), 4000);



