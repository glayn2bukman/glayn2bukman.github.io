"use strict";

// ALL SOTRAGE HERE IS PERMANENT

var FS_QUOTA = 64*1024*1024;

function void_func(){}

// passes (fname,ftype,data:Uint8Array) to `sucess`
function readFileAsArrayBuffer(file, oncomplete=void_func, onfail=void_func) {
    var fr = new FileReader();
    fr.onerror = onfail;
    if(fr.readAsArrayBuffer){
        fr.onload=function(){
            oncomplete(file.name,file.type,new Uint8Array(this.result));
        }
        return fr.readAsArrayBuffer(file);
    }else if(fr.readAsBinaryString) {
        fr.onload = function () {
            var string = this.resultString != null ? this.resultString : this.result;
            var result = new Uint8Array(string.length);
            for (var i = 0; i < string.length; i++) {
                result[i] = string.charCodeAt(i);
            }
            oncomplete(file.name,file.type,result);
        };
        return fr.readAsBinaryString(file);
    }else{
        onfail('could not read file as binary or text');
        return null;
    }
}

// oncomplete is called with (totalBytes,usedBytes)
function FS_usage(oncomplete=void_func,onfail=void_func){
    navigator.webkitPersistentStorage.queryUsageAndQuota(function(used,total){
        oncomplete(total,used);
    },onfail);
}

function _FS_getFileEntry(fs,fpath,oncomplete=void_func,onfail=void_func){
    fs.root.getFile(fpath, {create:false},function(entry){
        oncomplete(entry);
    },function(){onfail('failed to get file entry')});
}

function _FS_getDirectoryEntry(fs,path,oncomplete=void_func,onfail=void_func){
    fs.root.getDirectory(path, {create:false},function(entry){
        oncomplete(entry);
    },function(){onfail('failed to get directory entry')});
}

// ALL FS functions should call this before they proceed with anything!
// oncomplete is provided (fs,totalBytes,freeBytes)
function _FS_request(oncomplete=void_func,onfail=void_func){
    navigator.webkitPersistentStorage.requestQuota(FS_QUOTA, function(grantedBytes){
        //console.log(grantedBytes);
        window.webkitRequestFileSystem(window.PERSISTENT , grantedBytes, function(fs){
            FS_usage(function(totalBytes,usedBytes){
                oncomplete(fs,totalBytes,totalBytes-usedBytes);
            },function(){oncomplete(fs,-1,-1)});
        },onfail);
    },onfail);
}

function FS_mkdir(dirEntry, folders, oncomplete=void_func,onfail=void_func){
  folders = (typeof(folders)==typeof([]) ? folders:folders.split('/'));
  // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.

  if(!folders.length){
    oncomplete(dirEntry);
    return;
  }
  
  if(folders[0] == '.' || folders[0] == ''){
    folders = folders.slice(1);
  }
  dirEntry.getDirectory(folders[0], {create: true}, function(newDirEntry){
    // Recursively add the new subfolder (if we still have another to create).
    if(folders.length){
      FS_mkdir(newDirEntry, folders.slice(1),oncomplete,onfail);
    }
  }, onfail);
};

function FS_listdir(path, oncomplete=void_func,onfail=void_func,fs=null){
    function _(fs){
        _FS_getDirectoryEntry(fs,path,function(dirEntry){
            var dirReader = dirEntry.createReader();
            var entries = [];
            
            function _toArray(list) {
                return Array.prototype.slice.call(list || [], 0);
            }
            
            var readEntries = function(){
                dirReader.readEntries (function(results) {
                    if (!results.length) {
                        entries.sort();
                        oncomplete(dirEntry,entries);
                    } else {
                        entries = entries.concat(_toArray(results));
                        readEntries();
                    }
                }, onfail);
            }

            readEntries();
        },onfail);
    }
    
    null!=fs ? _(fs) : _FS_request(_,onfail);

}

function FS_rmdir(path,oncomplete=void_func,onfail=void_func,fs=null){
    function _(fs){
        _FS_getDirectoryEntry(fs,path,function(dirEntry){
            dirEntry.removeRecursively(oncomplete,onfail);
        },onfail);
    }
    null!=fs ? _(fs) : _FS_request(_,onfail);
}

function FS_rm(fpath,oncomplete=void_func,onfail=void_func,fs=null){
    function _(fs){
        _FS_getFileEntry(fs,fpath,function(fileEntry){
            fileEntry.remove(oncomplete,onfail);
        },onfail);
    }
    null!=fs ? _(fs) : _FS_request(_,onfail);
}

// write BINARY data to file, data:string||Uint8Array||ArrayBuffer
// this function wlll FAIL if file already exists! to solve this, first call FS_rm or set
// `overwrite` argument to true 
function FS_write(fpath,data,oncomplete=void_func,onfail=void_func,options={}){
    let overwrite = options.overwrite || false;
    let create_dirs = options.createDirs || false; // create path if it dint exist
    let appending = options.append || false;
    
    if(typeof(data)==typeof('')){
        const bytes = new Uint8Array(data.length);
        for(let i=0; i<bytes.byteLength; ++i){bytes[i]=data.charCodeAt(i);}
        data = bytes;
    }else if(typeof(data)==typeof(new ArrayBuffer(0))){
        data = new Uint8Array(data);
    }

    function _(){    
        _FS_request(function(fs=null,total=0,free=0){
            if(!total){return;}
            if(free<data.byteLength){
                onfail('need to write '+data.byteLength+' bytes but only have '+free+' free bytes');
                return;
            }

                                   // `exclusive:true` will raise an error if file exists
                                   // if `create` true and `exclusive` is false, JS will overwrite
                                   // the file from index 0 instead of first deleting the file eg
                                   // if original content is `abcde` and new content is `123` then 
                                   // after the operation, the file will have `123de`. cleary this
                                   // is not what you would have intended!
                                   //
                                   // also, `create` must be false if we are going to append
            
            fs.root.getFile(fpath, {create:appending?false:true, exclusive:true},function(file){
                    file.createWriter(function(writer) {
                      if(appending){writer.seek(writer.length);}
                      var blob = new Blob([data], /*{type: "text/plain"}*/);

                      writer.onwriteend = oncomplete;
                      writer.onerror = onfail;
                      writer.write(blob);
                    });
                
            },function(e){
                if(13==e.code){ // file already exists
                    if(overwrite){
                        FS_rm(fpath,function(){
                            FS_write(fpath,data,oncomplete,onfail,options);
                        },function(){
                            onfail('failed to overite file');
                        },fs);
                    }else{onfail(e);}
                }else{onfail(e);}
            });


        },onfail);
    }

    if(fpath.indexOf('/')>=0 && create_dirs){
        let paths = fpath.split('/');
        paths = paths.slice(0,paths.length-1);
        _FS_request(function(fs){
            FS_mkdir(fs.root, paths, _);
        },onfail);
    }else{_();}
}

// append BINARY data to file, data:string||Uint8Array
function FS_append(fpath,data,oncomplete=void_func,onfail=void_func){
    FS_write(fpath,data,oncomplete,onfail,{append:true});
}

// read BINARY data to file. passes (fname,ftype,data:Uint8Array) to `oncomplete` 
function FS_read(fpath,oncomplete=void_func,onfail=void_func, options={}){
    let read_as_text = options.readAsText || false;
    _FS_request(function(fs){
        _FS_getFileEntry(fs,fpath,function(fileEntry){
            fileEntry.file(function(file){
                readFileAsArrayBuffer(file,function(fname,ftype,data){
                    if(read_as_text){
                        let text = "";
                        for(let i=0; i<data.byteLength;++i){text += String.fromCharCode(data[i]);}
                        oncomplete(fname,ftype,text);
                    }else{oncomplete(fname,ftype,data);}
                    
                },onfail);
            },onfail);
        },onfail);
    },onfail);
}

// passes the fileURL to oncomplete
function FS_url(fpath,oncomplete=void_func,onfail=void_func){
    _FS_request(function(fs){
        _FS_getFileEntry(fs,fpath,function(fileEntry){
            oncomplete(fileEntry.toURL());
        },onfail);
    },onfail);
}
