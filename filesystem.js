

// File is an abstract class, a base for all other files. do NOT create an instance of this on its own

class File {
    constructor(parent, name) {
        this.parent = parent;
        this.name = name;
        if(parent != null){
            parent.childs.push(this);
        }
    }
    move(newParent){
        this.parent.childs.splice(this.parent.childs.indexOf(this), 1);
        newParent.add(this);
    }
    rename(newName){
        this.name = newName;
    }
    destroy(){
        let index;
        if(this.parent != null){
            index = this.parent.childs.indexOf(this);
        }
        if(index != -1){
            this.parent.childs.splice(index, 1);
        }
        this.name = "DELETED";
        this.parent = null;
    }
}

export class Directory extends File {
    constructor(parent = null, name){
        super(parent, name);
        this.childs = [];
    }
    add(file){
        if (file instanceof File){
            this.childs.push(file);
            file.parent = this;
        } else if (Array.isArray(file)){
            this.childs.push(...file);
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
        for(const file of this.childs){
            file.destroy();
        }
        super.destroy();
    }
    destroy(){
        if (this.parent === null && this.name === "root"){
            this.forceDestroy();
        } else {
            this.parent.add(this.childs);
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

