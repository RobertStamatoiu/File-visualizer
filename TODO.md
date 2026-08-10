# Filesystem TODO

## 🛡️ Safety / Validation

- [x] Validate `move(newParent)`
  - [x] Ensure `newParent` is a `Directory`
  - [x] Prevent moving a file into itself
  - [x] Prevent moving a directory into one of its descendants
  - [x] Prevent moving an already-destroyed file
  - [x] Prevent moving a file to its current parent
  - [x] Prevent moving the root

- [x] Validate `add(file)`
  - [x] Ensure the argument is a `File` or an array of `File`s
  - [x] Reject invalid array elements
  - [x] Prevent adding the same file twiceanother parent

- [ ] Validate `remove(file)`
  - [ ] Handle files that are not children of this directory
  - [ ] Handle already-destroyed files
  - [ ] Handle invalid arguments

- [ ] Validate `destroy()`
  - [ ] Prevent destroying the root accidentally
  - [ ] Ensure recursive destruction cannot skip children
  - [ ] Ensure destroyed objects have `parent === null`
  - [ ] Ensure destroyed directories have no remaining children

- [ ] Validate `rename(newName)`
  - [ ] Reject invalid/empty names
  - [ ] Decide whether duplicate names are allowed

- [ ] Validate `TextFile.edit(newContent)`
  - [ ] Decide what content types are allowed

## 📦 Filesystem Integrity

- [ ] Ensure every child has the correct `.parent`
- [ ] Ensure every parent's `children` array contains each child exactly once
- [ ] Prevent cycles in the tree
- [ ] Decide how root is identified
- [ ] Decide whether `"DELETED"` should remain the name of destroyed files
- [x] Consider renaming `childs` → `children`

## 💬 Return Messages

- [ ] Make every mutating function return a result
- [x] Create consistent success/failure result objects
- [ ] Add stable result codes
- [x] Add human-readable messages
- [x] Decide whether successful operations return the modified object
- [x] Decide whether failed operations leave the filesystem completely unchanged

### Suggested result format

```js
{
    success: true,
    code: "MOVE_SUCCESS",
    message: "File moved successfully."
}
```