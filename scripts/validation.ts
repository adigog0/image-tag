export function validation(tagContainer:HTMLInputElement){
    if(tagContainer.value === ""){
        return false;
    }
    else{
        return true;
    }

}