// Lens Studio Scene Hierarchy Printer
//
// @input bool printOnStart {"label":"Print on Lens Start"}
//
// Description:
// This script provides a method to print all SceneObjects in the current scene
// to the Logger, formatted as a hierarchical tree.
// You can trigger this by checking "Print on Lens Start" in the Inspector panel,
// or by calling the `printHierarchy` function from another script.

/**
 * The main function to initiate the printing of the scene hierarchy.
 * It finds all root objects (objects without a parent) and starts the
 * recursive printing process from them.
 */
function printSceneHierarchy() {
    print("--- Scene Hierarchy Start ---");

    var rootObjectsCount = global.scene.getRootObjectsCount();

    // Iterate over all root objects in the scene.
    for (var i = 0; i < rootObjectsCount; i++) {
        var rootObject = global.scene.getRootObject(i);
        // Start the recursive printing from each root object.
        printObjectRecursive(rootObject, 0);
    }

    print("--- Scene Hierarchy End ---");
}

/**
 * A recursive function that prints a SceneObject and all its children.
 * It uses indentation to visually represent the hierarchy depth.
 *
 * @param {SceneObject} object - The SceneObject to print.
 * @param {number} depth - The current depth in the hierarchy for indentation.
 */
function printObjectRecursive(object, depth) {
    // 1. Create an indentation string based on the current depth.
    // Each level of depth adds two spaces for a clear visual hierarchy.
    var indentation = "";
    for (var j = 0; j < depth; j++) {
        indentation += "  "; // Using two spaces for indentation.
    }

    // 2. Get information about the components on the object.
    var componentsInfo = "";
    
    // By passing the base component type "Component", we can retrieve all
    // components attached to the SceneObject, as they all inherit from it.
    var allComponents = object.getComponents("Component");
    
    if (allComponents && allComponents.length > 0) {
        var componentNames = [];
        for (var i = 0; i < allComponents.length; i++) {
            var component = allComponents[i];
            if (component && component.getTypeName) {
                //Check if the component is a tween if so add additional info
                if(component.tweenType){
                    print('Found tween component');
                    const tweenInfo = `${component.getTypeName()}-TweenScript (type:${component.tweenType}, name:${component.tweenName})`;
                    componentNames.push(tweenInfo);
                }else{
                    componentNames.push(component.getTypeName());
                }
            }
        }
        // Format the component names into a string like "(Camera, ScriptComponent)"
        componentsInfo = " (" + componentNames.join(", ") + ")";
    }


    // 3. Print the current object's name with the calculated indentation and component info.
    // FIX: Changed object.getName() to object.name, which is the correct way
    // to access the name property of a SceneObject.
    print(indentation + "|-- " + object.name + componentsInfo);

    // 4. Get all children of the current object and recurse.
    var childrenCount = object.getChildrenCount();
    for (var i = 0; i < childrenCount; i++) {
        var child = object.getChild(i);
        // Call the function for each child, increasing the depth by 1.
        printObjectRecursive(child, depth + 1);
    }
}



const onStart = script.createEvent("OnStartEvent");
onStart.bind(function() {
    // Check the input checkbox from the Inspector panel.
    // If true, run the function when the lens starts.
    if (script.printOnStart) {
        printSceneHierarchy();
    }
});

// Expose the main function via the script's API. This allows you to call it
// from other scripts or events in your project.
// Example of how to call from another script:
script.printHierarchy = printSceneHierarchy;