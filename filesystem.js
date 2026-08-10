
const bannedCharacters = " \t\n\\/:<>";

function shareCharacters(a, b) {
    const chars = new Set(a);

    return [...b].some(char => chars.has(char));
}

function success(code, message){
    return {
        success: true,
        returnCode: code,
        message: message
    };
}

function fail(code, message){
    return {
        success: false,
        returnCode: code,
        message: message
    };
}

// File is an abstract class, a base for all other files. do NOT create an instance of this on its own

class File {
    constructor(parent, name) {
        if (new.target === File) {
            throw new Error("I told you File is an abstract class!");
        }
        if(shareCharacters(name, bannedCharacters)){
            throw new Error(`Cannot create \"${name}\" because it contains invalid characters`);
        }
        this.parent = parent;
        this.name = name;
        if(parent != null){
            parent.children.push(this);
        }
    }
    descendantOf(file){
        let current = this.parent;
        while(current !== null){
            if(current === file){
                return true;
            }
            current = current.parent;
        }
        return false;
    }
    move(newParent){
        if(!(newParent instanceof Directory)){
            return fail(
                "MOVE_TO_NON_DIRECTORY",
                `Cannot move ${this.name} to ${newParent.name} because ${newParent.name} is not a directory`
            );
        } else if (newParent === null || newParent === undefined){
            return fail(
                "MOVE_TO_NULL",
                `Cannot move \"${this.name}\" to a null directory`
            );
        } else if (newParent === this){
            return fail(
                "MOVE_TO_SELF",
                `Cannot move ${this.name} to itself`
            );
        } else if (newParent.parent === null && newParent !== root){
            return fail(
                "MOVE_TO_DEL",
                `Cannot move ${this.name} because destination has been deleted`
            );
        } else if (newParent === this.parent){
            return fail(
                "MOVE_TO_PARENT",
                `Cannot move ${this.name} to ${newParent.name} because ${this.name} is already inside ${newParent.name}`
            );
        } else if (this.name === "root"){
            return fail(
                "MOVE_ROOT",
                `Cannot move the root`
            );
        } else if (newParent.descendantOf(this)){
            return fail(
                "MOVE_TO_CHILD",
                `Cannot move ${this.name} to ${newParent.name} because ${newParent.name} is a descendant ot ${this.name}`
            );
        } else if (this.name === "" && this.parent === null){
            return fail(
                "MOVING_DELETED",
                `Cannot move this file because it doesn't exist`
            );
        }
        this.parent.children.splice(this.parent.children.indexOf(this), 1);
        return newParent.add(this);
        
    }
    rename(newName){
        if(newName === "" || newName.replace(/\s/g, "") === ""){
            return fail(
                "EMPTY_NAME",
                `Cannot rename \"${this.name}\" to an empty string`
            );
        } else if(
            newName.includes("/")  ||
            newName.includes("\\") ||
            newName.includes(" ")  ||
            newName.includes("\t") ||
            newName.includes("\n") ||
            newName.includes("\"") ||
            newName.includes(":")  ||
            newName.includes(">")  ||
            newName.includes("<")
        ) {
            return fail(
                "INVALID_NAME",
                `Cannot rename \"${this.name}\" to \"${newName}\" because it contains invalid charcaters`
            );
        }
        let oldName = this.name;
        this.name = newName;
        return success(
            "SUCCESSFUL_RENAME",
            `Successfully renamed \"${oldName}\" to \"${newName}\"`
        )
    }
    destroy(){
        let index;
        if(this.parent != null){
            index = this.parent.children.indexOf(this);
        } else if (this.name === "root"){
            return fail(
                "DEL_ROOT",
                `Cannot delete the root directory`
            );
        } else {
            return fail(
                "DEL_ALREADY_DELETED",
                `Cannot delete this file because it doesn't exist`
            );
        }
        if(index != -1){
            this.parent.children.splice(index, 1);
        } else {
            return fail(
                "UNKNOWN_ERROR",
                `An unknown error occured when deleting \"${this.name}\"`
            );
        }
        this.parent = null;
        let oldName = this.name;
        this.name = "";
        return success(
            "SUCCESSFUL_DEL",
            `Successfully deleted \"${oldName}\"`
        );
        
    }
}


export class Directory extends File {
    constructor(parent = null, name){
        super(parent, name);
        this.children = [];
    }
    add(file){
        if(file instanceof File){
            let index = this.children.indexOf(file);
            if(index != -1) {
                return fail(
                    "ADD_TO_PARENT",
                    `\"${file.name}\" is already a part of \"${this.name}\"`
                );
            } else if (file.parent === null && file !== root){
                return fail(
                    "ADD_DELETED",
                    `Cannot add this file to \"${this.name}\" because this file has been deleted`
                );
            } else if (this.descendantOf(file)){
                return fail(
                    "ADD_TO_DESCENDANT",
                    `Cannot add \"${file.name}\" to \"${this.name}\" because \"${this.name}\" is a descendant of \"${file.name}\"`
                );
            } else if (file === this) {
                return fail(
                    "MOVE_TO_SELF",
                    `Cannot add \"${this.name}\" to itself`
                );
            }
            file.parent.children.splice(file.parent.children.indexOf(file), 1);
            file.parent = this;
            this.children.push(file);
            return success(
                "SUCCESSFULL_ADD",
                `Successfully added \"${file.name}\" to \"${this.name}\"`
            );

        } else if (Array.isArray(file)) {
            let successState = [];
            for(const f of file){
                successState.push(this.add(f));
            }
            return successState;
        } else {
            return fail(
                "NON_FILE_INPUT",
                `Can only add file-like objects to a directory, not ${typeof file}`
            )
        }
    }
    remove(file){
        if (file instanceof File){
            let index = this.children.indexOf(file);
            if (index === -1){
                return fail(
                    "DEL_NO_EXIST",
                    `\"${file.name}\" does not exist inside folder \"${this.name}\"`
                );
            } else {
                return file.destroy();
            }
        } else if (Array.isArray(file)){
            let successState = []
            for (const f of file){
                successState.push(this.remove(f));
            }
            return successState;
        } else {
            return fail(
                "INVALID_ARG",
                `Can only remove file-like objects, not ${typeof file}`
            );
        }
    }
    forceDestroy(){
        if(this.parent === null && this.name === "root"){
            return fail(
                "ROOT_DEL",
                `Cannot force destroy the root directory`
            );
        }
        let copy = [...this.children]
        for(const file of copy){
            file.destroy();
        }
        let oldName = this.name;
        return super.destroy();
    }
    destroy(){
        if (this.parent === null && this.name === "root"){
            return fail(
                "ROOT_DEL",
                `Cannot destroy the root directory`
            );
        }else if (this.parent === null){
            return fail(
                "DOUBLE_DEL",
                `Cannot delete this directory because it doesn't exist`
            );
        } else {
            this.parent.add(this.children);
            return super.destroy();
        }
    }

}

export const root = new Directory(null, "root");

export class TextFile extends File {
    constructor(parent, name, content = ""){
        if(parent == null || !(parent instanceof Directory)){
            throw new Error("Cannot create a file without a parent directory");
        }
        super(parent, name + ".txt");
        this.content = content;
    }
    edit(newContent){
        this.content = newContent;
        return success(
            "SUCCESSFUL_EDIT",
            `Successfully edited \"${this.name}\"`
        );
    }
}

