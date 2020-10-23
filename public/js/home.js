const sectionItemTabs = document.getElementsByClassName('nav-section-tab');

const toggleHide = (elements, toggle) => {
    for(let i = 1; i < elements.children.length; i++) {
        if(toggle)
            elements.children[i].classList.add('hide');
        else
            elements.children[i].classList.remove('hide');
    }
}

const expandTab = event => {
    const section = event.currentTarget.children[2];
    if(section.classList.contains('rotateDown')) {
        // Hide tabs for clicked section
        section.classList.remove('rotateDown');
        section.classList.add('rotateUp');
        toggleHide(section.parentNode.parentNode, true);
    }
    else { // Show the tabs for clicked section
        section.classList.add('rotateDown');
        toggleHide(section.parentNode.parentNode, false);
    }
};

for(tabs of sectionItemTabs) {
    toggleHide(tabs, true); // Hide all tabs first on page load
    tabs.children[0].addEventListener('mouseup', event => expandTab(event));
}