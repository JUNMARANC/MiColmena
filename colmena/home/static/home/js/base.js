window.onscroll = function() {
    let header = document.getElementById("header");

    if (document.documentElement.scrollTop > 80 || document.body.scrollTop > 80) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };