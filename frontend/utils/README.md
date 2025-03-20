# Dialog Utilities for Web and Native Platforms

This directory contains utility functions for displaying dialogs in a platform-specific way.

## Files

-   `dialog.js`: Contains utility functions for displaying dialogs in a platform-specific way.

## Usage

### Import the utility functions

```javascript
import {
    showAlert,
    showConfirmDialog,
    showDeleteConfirmDialog,
} from "../utils/dialog";
```

### Show a simple alert dialog

```javascript
// For web platform, this will use a custom dialog component
// For native platforms, this will use Alert.alert
if (Platform.OS === "web") {
    showAlert("Title", "Message");
} else {
    Alert.alert("Title", "Message");
}
```

### Show a confirmation dialog

```javascript
// For web platform, this will use a custom dialog component
// For native platforms, this will use Alert.alert
if (Platform.OS === "web") {
    showConfirmDialog("Title", "Message", onConfirm, onCancel);
} else {
    Alert.alert("Title", "Message", [
        { text: "Cancel", style: "cancel", onPress: onCancel },
        { text: "OK", onPress: onConfirm },
    ]);
}
```

### Show a delete confirmation dialog

```javascript
// For web platform, this will use a custom dialog component
// For native platforms, this will use Alert.alert
if (Platform.OS === "web") {
    showDeleteConfirmDialog(
        "Confirm Delete",
        "Are you sure you want to delete this item?",
        onDelete
    );
} else {
    Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this item?",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", onPress: onDelete, style: "destructive" },
        ]
    );
}
```

## Implementation Details

The utility functions use a custom dialog component for web platform and `Alert.alert` for native platforms. This ensures a consistent user experience across all platforms.

### Web Dialog Component

The web dialog component is a simple React component that renders a modal dialog with a title, message, and buttons. It uses React DOM's `createRoot` API for rendering, which is compatible with React 18.
