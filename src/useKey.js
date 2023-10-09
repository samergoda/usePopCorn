import { useEffect } from "react"

export function useKey(action){
    useEffect(()=>{
        function callBack(e){
          if(e.code==='Escape'){
            action()
          }
        }
        document.addEventListener('keydown',callBack)
        return()=> document.addEventListener('keydown',callBack)
    
      },[action])
}