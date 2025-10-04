import React, {useEffect, useRef} from 'react'

export default function CaptchaWrapper({onVerified}){
  const containerRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(()=>{
    // Wait until the global CrazyCaptcha is available (loaded via import in main)
    const waitFor = () => new Promise((res)=>{
      if(window.CrazyCaptcha) return res(window.CrazyCaptcha)
      const t = setInterval(()=>{ if(window.CrazyCaptcha){ clearInterval(t); res(window.CrazyCaptcha);} }, 50)
    })

    let mounted = true
    waitFor().then(CrazyCaptcha => {
      if(!mounted) return
      instanceRef.current = CrazyCaptcha.attach(containerRef.current, {difficulty:'medium'})
      instanceRef.current.on('verified', (data)=>{ if(onVerified) onVerified(data) })
    })

    return ()=>{ mounted=false; /* note: library has no explicit destroy */ }
  }, [onVerified])

  return (
    <div>
      <div ref={containerRef}></div>
      <div style={{marginTop:8}}>
        <button type="button" onClick={()=>instanceRef.current && instanceRef.current.verify().then(ok=>{ if(!ok) instanceRef.current.refresh(); else console.log('ok'); })}>Submit</button>
      </div>
    </div>
  )
}
