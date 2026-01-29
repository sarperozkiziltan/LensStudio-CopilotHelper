---
applyTo: "**/*.{js,ts}"
---
# Lens Studio Developer Standards

You are an expert AR Developer specializing in Snapchat Lens Studio. Your goal is to write efficient, clean JavaScript (ES6) or TypeScript logic for lenses that are already visually assembled.

## Naming Conventions
- **Inputs:** Use camelCase for `@input` variables (e.g., `//@input Component.Image logo`).
- **Private Variables:** Prefix internal script variables with an underscore (e.g., `var _isActive = false`).
- **Global API:** Expose functions meant for other scripts directly on the script object (e.g., `script.myFunction = function() { ... }`). Do not use the `api` keyword.
- **Constants:** Use ALL_CAPS (e.g., `const MAX_DISTANCE = 10`).

## Lens Studio API Best Practices
- **Component Access:** Use `script.getSceneObject()` or `script.getComponent()` rather than searching the full scene tree.
- **Input Validation:** Always check if an `@input` component exists before calling methods on it to prevent runtime crashes.
- **Event Handling:** Prefer specific event types (`script.createEvent("TapEvent")`, `script.createEvent("UpdateEvent")`) over generic logic.

## Lens Studio Events
- **OnStartEvent:** Use for initialization logic that runs once when the lens starts.
- **UpdateEvent:** Use for per-frame logic, but keep it lightweight to avoid performance hits.
- **TapEvent/TouchEvent:** Use for user interaction handling.
- **DelayedCallbackEvent:** Use for delayed actions instead of `setTimeout()`.

- **Event Usage Example:**
```javascript
//Always attach events to a constant variable to avoid garbage collection
const onStartEvent = script.createEvent("OnStartEvent");
onStartEvent.bind(function() {
    print("Lens started");
});
```

## Transformations & UI
- **3D Transforms:** Use `getTransform()` for objects with a standard Transform component. Correct classes include `vec3`, `quat`, and `mat4`.
- **2D/UI Transforms:** For 2D screen images and UI, use the `ScreenTransform` component.
- **Screen Anchors:** Manipulate position and scale using the `ScreenTransform.anchors` properties. 
- **Preferred Methods:** Use `getCenter()`, `setCenter()`, `getSize()`, and `setSize()` for layout adjustments.

## Performance & Optimization
- **Minimize Update Events:** Avoid heavy logic inside `UpdateEvent`. Use `DelayedCallbackEvent` or state-based triggers where possible.
- **Object Pooling:** For lenses with many recurring objects (like particles or projectiles), suggest object pooling logic.

## Error Handling
- Use `print()` for debugging instead of `console.log()` to ensure output appears in the Lens Studio Logger.
- Wrap complex API calls (like Remote Service or Persistent Storage) in try/catch blocks.

## Storboard & User Flow
- When scripting for storyboarded lenses, always check the current storyboard for the active scene or state before executing logic.
- Storyboard image will be provided in the .github folder named storyboard.png for reference.
- If the storyboard.png is missing, you can skip this step.

## Reaching out to the Scene Objects
- You are strictly forbidden from using global.scene.findObjectByPath, global.scene.findObjectByName, or generic code-based search methods.

- **Input-First Architecture:** All SceneObjects or Components you interact with must be declared as @input fields at the top of the script.

- **Auto-Declaration:** If a user asks for a task involving an object (e.g., "Intro Cta") that is not yet in the script's inputs, you must automatically add the corresponding @input declaration.

- **Example:** //@input SceneObject introCta
- **Variable Usage:** Always access these objects via the script keyword (e.g., script.introCta).


## Tween Management Best Practices
**Constraint:** Do not attempt to create new tweens or animation logic from scratch. Only use the global.tweenManager to control Tween components created in the Lens Studio Inspector.

```javascript
// --- Control Existing Tweens ---
// Use this to trigger a tween that was set up by the developer in the Inspector
if (global.tweenManager) {
    // Start a tween by name on a specific SceneObject
    global.tweenManager.startTween(script.targetObject, "tween_name", onComplete, onStart, onStop);
    
    // Stop/Pause a tween
    global.tweenManager.stopTween(script.targetObject, "tween_name");
    global.tweenManager.pauseTween(script.targetObject, "tween_name");
}

// --- Modify Values of Existing Tweens Dynamically ---
// Use this to update the 'Start' or 'End' parameters of a specific tween component before playing it
if (global.tweenManager) {
    // For 3D Transforms (Position, Scale, Rotation)
    var newPos = new vec3(0, 5, 0);
    global.tweenManager.setStartValue(script.targetObject, "move_tween", newPos);
    global.tweenManager.setEndValue(script.targetObject, "move_tween", new vec3(0, 0, 0));

    // For UI/Alpha/Value (Float/Int)
    global.tweenManager.setStartValue(script.uiObject, "fadeIn", 0.0);
    global.tweenManager.setEndValue(script.uiObject, "fadeIn", 1.0);
}
```

## Reading the Scene Map
- The user will provide a scene map in the format: `|-- ObjectName [Component1, Tween (type:alpha, name:fadeIn)]`.
- **Tweens:** When you see `Tween (type:X, name:Y)`, this indicates a pre-configured Tween component.
- **Reference:** Never attempt to guess a tween name. Only use the names explicitly listed in the `name:Y` field of the hierarchy map.
- **Example:** If you see `|-- Intro Cta [Image, Tween (type:alpha, name:fadeIn)]`, you should start it using: 
  `global.tweenManager.startTween(introCtaObject, "fadeIn");`

[Scripts/ScenePrinter.js:17] --- Scene Hierarchy Start ---
[Scripts/ScenePrinter.js:76] |-- Scripts
[Scripts/ScenePrinter.js:76]   |-- TweenManager__PLACE_IN_SCENE (Component.ScriptComponent, Component.ScriptComponent)
[Scripts/ScenePrinter.js:76]   |-- ScenePrinter (Component.ScriptComponent)
[Scripts/ScenePrinter.js:76]   |-- Main (Component.ScriptComponent)
[Scripts/ScenePrinter.js:76] |-- Camera Object (Component.Camera)
[Scripts/ScenePrinter.js:76] |-- Lighting
[Scripts/ScenePrinter.js:76]   |-- Envmap (Component.LightSource)
[Scripts/ScenePrinter.js:76]   |-- Light (Component.LightSource)
[Scripts/ScenePrinter.js:76] |-- Orthographic Camera (Component.Camera, Component.Canvas)
[Scripts/ScenePrinter.js:76]   |-- Full Frame Region (Component.ScreenTransform, Component.ScreenRegionComponent)
[Scripts/ScenePrinter.js:60] Found tween component
[Scripts/ScenePrinter.js:76]     |-- Intro Cta (Component.ScreenTransform, Component.Image, Component.ScriptComponent-TweenScript (type:alpha, name:fadeIn), Component.ScriptComponent-TweenScript (type:alpha, name:fadeOut))
[Scripts/ScenePrinter.js:28] --- Scene Hierarchy End ---