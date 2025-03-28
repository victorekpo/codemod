# CodeMod Project Overview

## Purpose

The **CodeMod** project aims to automate the migration process of `context`-related code within a JavaScript codebase. The migration primarily focuses on transforming certain properties of the context object. Specifically, it replaces `user` with `profile` and `name` with `fullName` on the context object. This migration is necessary for adapting to a new naming convention in our codebase while ensuring smooth transitions for both ES6 and CommonJS modules.

The project utilizes **JsCodeShift**, a tool for running codemods over a codebase. JsCodeShift provides an easy way to perform search and replace tasks in JavaScript files, making it an excellent fit for this migration task.

## Tools and Functions

### JsCodeShift

[**JsCodeShift**](https://github.com/facebook/jscodeshift) is a toolkit for running codemods on JavaScript and TypeScript codebases. It provides a way to apply changes in a codebase by parsing the source code into an abstract syntax tree (AST) and performing transformations on the tree.

### Migration Workflow

The core of our migration process involves gathering all files that are either exporting or importing the context object. Once we've identified these files, we proceed with replacing the `user` and `name` properties in the `context` object with `profile` and `fullName`.

## Key Functions

### Gather Exported and Imported Context:

The function **gatherFilesWithContext** gathers all files that export and import context. It checks if any file exports context or derived variables and if any file imports context from those exports.

### Check Context Imports in Migration:

The migration script checks if a file is importing `my-lib` or matches any file that's importing from an exported context (from the list gathered). If a match is found, it proceeds with the migration, replacing `user` with `profile` and `name` with `fullName` on the context object.

### Migration Script:

It runs the migration logic using the **findAndReplaceProperty** function to update the context properties based on the migration rules. This transformation is applied to every file that imports the context object from the specified sources.

## Folder Structure

| Folder Name                | Description                                                         |
|----------------------------|---------------------------------------------------------------------|
| **/src/jscodeshift**       | Contains the main code files and migration scripts for jscodeshift. |
| **/src/jscodeshift/utils** | Includes utility functions and migration helpers for jscodeshift.   |
| **/src/jscodeshift/code**  | Holds files for testing the migration.                              |

## How the Migration Works

1. **Gather Context Imports and Exports**: We gather files that either export or import context, particularly looking at files that import context from `my-lib` or other files exporting context.
2. **Check Context Imports in Migration**: If a file imports `my-lib` or matches any file in the list of files importing from exported context, it proceeds with the migration.
3. **Run Migration Script**: Using **findAndReplaceProperty**, the migration script searches for the properties `user` and `name` in the context object and replaces them with `profile` and `fullName`, respectively.

## Final Thoughts

This migration ensures that the codebase is updated according to the new conventions and that all necessary files are transformed. It helps streamline the process of renaming properties in the `context` object and ensures that all imports and exports are correctly handled across the codebase.
