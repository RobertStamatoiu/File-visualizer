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
        this.parent = parent;
        this.name = name;
        if(parent != null){
            parent.children.push(this);
        }
    }
    descendantOf(file){
        let current;
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
        }
        this.parent.children.splice(this.parent.children.indexOf(this), 1);
        newParent.add(this);
        return success(
            "MOVE_SUCCESS",
            `Successfully moved ${this.name} to ${newParent.name}`
        );
    }
    rename(newName){
        this.name = newName;
    }
    destroy(){
        let index;
        if(this.parent != null){
            index = this.parent.children.indexOf(this);
        }
        if(index != -1){
            this.parent.children.splice(index, 1);
        }
        this.name = "DELETED";
        this.parent = null;
    }
}


export class Directory extends File {
    constructor(parent = null, name){
        super(parent, name);
        this.children = [];
    }
    add(file){
        if (file instanceof File){
            this.children.push(file);
            file.parent = this;
        } else if (Array.isArray(file)){
            file = [...new Set(file)]
            this.children.push(...file);
            for(const f of file){
                f.parent = this;
            }
        }
    }
    remove(file){
        if (file instanceof File){
            if(file.parent == this){
                file.destroy()
            }
        } else if (Array.isArray(file)){
            for(const f of file){
                this.remove(f);
            }
        }
    }
    forceDestroy(){
        for(const file of this.children){
            file.destroy();
        }
        super.destroy();
    }
    destroy(){
        if (this.parent === null && this.name === "root"){
            this.forceDestroy();
        } else {
            this.parent.add(this.children);
            super.destroy();
        }
    }

}

export const root = new Directory(null, "root");

export class TextFile extends File {
    constructor(parent, name, content = ""){
        super(parent, name + ".txt");
        this.content = content;
    }
    edit(newContent){
        this.content = newContent;
    }
}

