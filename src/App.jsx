import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const drinks = [
  { id:'espresso', number:'01', name:'Espresso Lumière', short:'La primera luz', origin:'Etiopía Yirgacheffe & Huila', notes:'Jazmín · miel · bergamota', roast:'Medio ligero', description:'Extracción corta de cuerpo sedoso y acidez floral brillante.', tone:'#d99d59', bean:'#8a492c', scene:'lumiere', image:'/espresso.png' },
  { id:'latte', number:'02', name:'Latte L’Heure Dorée', short:'La pausa cálida', origin:'Cerrado Mineiro, Brasil', notes:'Avellana tostada · vainilla · caramelo', roast:'Medio', description:'Base intensa equilibrada con leche texturizada a 60°C.', tone:'#e5c69e', bean:'#603521', scene:'doree', image:'/latte.png' },
  { id:'cold', number:'03', name:'Cold Brew Ambré', short:'El último resplandor', origin:'Antigua, Guatemala', notes:'Cacao amargo · naranja confitada · panela', roast:'Medio oscuro', description:'Infusión lenta en frío durante 18 horas. Refrescante y profundo.', tone:'#bb7547', bean:'#38241c', scene:'ambre', image:'/cold-brew.png' },
]

function Bean({ position, color, scale=1, onHover }) {
  const beanRef = useRef()
  useFrame(({clock}) => { if(beanRef.current) beanRef.current.rotation.y = clock.elapsedTime*.22 + position[0] })
  return <group ref={beanRef} position={position} scale={scale} onPointerOver={onHover} onPointerOut={() => onHover(false)}>
    <mesh castShadow scale={[.23,.32,.15]} rotation={[.25,0,.35]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color={color} roughness={.5}/></mesh>
    <mesh position={[0,0,.146]} rotation={[0,0,.33]}><torusGeometry args={[.18,.012,6,24,Math.PI]}/><meshStandardMaterial color="#21140e"/></mesh>
  </group>
}

function Cup({ drink, detail, roastHover }) {
  const group = useRef()
  const cup = useRef()
  const liquid = useRef()
  const [pointerDown,setPointerDown] = useState(null)
  useEffect(() => {
    if (!group.current || !cup.current || !liquid.current) return
    gsap.to(group.current.rotation,{y:drink.id==='cold'?.38:drink.id==='latte'?.1:-.17,duration:1.3,ease:'power2.inOut'})
    gsap.to(cup.current.position,{y:drink.id==='cold'?.1:0,duration:1.1})
    liquid.current.material.color.set(drink.id==='latte'?'#a56c42':drink.id==='cold'?'#45251b':'#3d2419')
  },[drink])
  useFrame(({clock}) => { if(group.current) group.current.position.y = Math.sin(clock.elapsedTime*.8)*.045 })
  const drag = e => { if(pointerDown===null || !group.current) return; group.current.rotation.y += (e.clientX-pointerDown)*.008; setPointerDown(e.clientX) }
  return <group ref={group} position={[0,-.28,0]} scale={.77} rotation={[0,-.17,0]} onPointerDown={e=>{e.stopPropagation();e.target.setPointerCapture(e.pointerId);setPointerDown(e.clientX)}} onPointerMove={drag} onPointerUp={()=>setPointerDown(null)}>
    <group ref={cup} scale={detail?1.14:1}>
      <mesh position={[0,-.86,0]} receiveShadow><cylinderGeometry args={[1.65,1.65,.06,64]}/><meshStandardMaterial color="#b9a98e" metalness={.12} roughness={.34}/></mesh>
      <mesh position={[0,-.78,0]} receiveShadow><cylinderGeometry args={[1.35,1.48,.12,64]}/><meshStandardMaterial color="#ebe2d2" roughness={.28}/></mesh>
      <mesh position={[0,-.3,0]} castShadow receiveShadow><cylinderGeometry args={[.84,.64,1.07,64,1,true]}/><meshPhysicalMaterial color={drink.id==='cold'?'#b39a79':'#e9e0cf'} metalness={.09} roughness={drink.id==='cold'?.2:.28} side={THREE.DoubleSide} transparent={drink.id==='cold'} opacity={drink.id==='cold'?.84:1}/></mesh>
      <mesh position={[0,-.83,0]}><cylinderGeometry args={[.64,.64,.05,64]}/><meshStandardMaterial color="#d6cbb8"/></mesh>
      <mesh position={[0,.23,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.84,.075,12,64]}/><meshStandardMaterial color="#fff4e4" metalness={.04} roughness={.24}/></mesh>
      <mesh ref={liquid} position={[0,.205,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.77,64]}/><meshStandardMaterial color="#3d2419" roughness={.23}/></mesh>
      {drink.id==='latte' && <group position={[0,.214,0]} rotation={[-Math.PI/2,0,0]}><mesh><ringGeometry args={[.24,.34,64]}/><meshBasicMaterial color="#f7e4c6"/></mesh><mesh><ringGeometry args={[.48,.55,64]}/><meshBasicMaterial color="#f7e4c6"/></mesh></group>}
      {drink.id==='cold' && [0,1,2].map(i=><mesh key={i} position={[[.2,.02,.24],[-.28,-.05,-.2],[.15,-.12,-.22]][i]} rotation={[i*.4,i*.8,i*.2]}><boxGeometry args={[.27,.27,.27]}/><meshPhysicalMaterial color="#e5e6dd" transparent opacity={.45} roughness={.04} transmission={.35}/></mesh>)}
      <mesh position={[.91,-.22,0]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[.43,.12,12,48,Math.PI*1.65]}/><meshStandardMaterial color="#eee2d0" roughness={.25}/></mesh>
    </group>
    <Bean position={[-1.65,.18,-.5]} color={drink.bean} scale={.9} onHover={roastHover}/>
    <Bean position={[1.62,.62,-.8]} color={drink.bean} scale={.72} onHover={roastHover}/>
    <Bean position={[1.35,-.9,.75]} color={drink.bean} scale={.58} onHover={roastHover}/>
  </group>
}

function Scene({drink,detail,roastHover}) {
  return <Canvas shadows dpr={[1,1.65]} camera={{position:detail?[0,1.5,5]:[0,1.4,6.6],fov:38}} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}}>
    <ambientLight intensity={1.3}/><directionalLight position={[-3,6,5]} intensity={3.2} color="#ffe1b5" castShadow shadow-mapSize={[1024,1024]}/><pointLight position={[3,0,2]} intensity={18} color={drink.tone}/><pointLight position={[-4,2,-3]} intensity={13} color="#fff5db"/>
    <Cup drink={drink} detail={detail} roastHover={roastHover}/>
  </Canvas>
}

function App(){
  const [active,setActive]=useState(0), [entered,setEntered]=useState(false), [progress,setProgress]=useState(0), [detail,setDetail]=useState(false), [panel,setPanel]=useState(null), [corner,setCorner]=useState('Ventanal'), [name,setName]=useState(''), [time,setTime]=useState(''), [notice,setNotice]=useState(''), [sound,setSound]=useState(false)
  const audio=useRef(null), drink=drinks[active]
  useEffect(()=>{ const start=performance.now(); let raf; const tick=()=>{ const value=Math.min(100,Math.floor((performance.now()-start)/19));setProgress(value);if(value<100)raf=requestAnimationFrame(tick) };raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[])
  useEffect(()=>{ if(!entered)return; const lenis=new Lenis({duration:1.15,smoothWheel:true}); const update=t=>lenis.raf(t*1000);lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(update);gsap.ticker.lagSmoothing(0);const ctx=gsap.context(()=>{gsap.from('.hero-title > *',{y:90,opacity:0,stagger:.18,duration:1.35,ease:'power3.out'});gsap.utils.toArray('.chapter').forEach((chapter)=>{gsap.fromTo(chapter.querySelector('.chapter-art'),{scale:1.16},{scale:1,ease:'none',scrollTrigger:{trigger:chapter,start:'top bottom',end:'bottom top',scrub:1}});gsap.from(chapter.querySelector('.chapter-product'),{y:100,opacity:0,scale:.9,duration:1.1,ease:'power2.out',scrollTrigger:{trigger:chapter,start:'top 65%'}});gsap.from(chapter.querySelectorAll('.chapter-copy > *'),{y:55,opacity:0,stagger:.1,duration:1,ease:'power2.out',scrollTrigger:{trigger:chapter,start:'top 65%'}})});gsap.from('.story-copy > *',{scrollTrigger:{trigger:'.story',start:'top 75%'},y:35,opacity:0,stagger:.12,duration:.9});gsap.from('.closing-inner > *',{scrollTrigger:{trigger:'.closing',start:'top 75%'},y:30,opacity:0,stagger:.14,duration:.85})});return()=>{ctx.revert();gsap.ticker.remove(update);lenis.destroy()}},[entered])
  useEffect(()=>{ if(entered) gsap.fromTo('.drink-info > *',{y:14,opacity:0},{y:0,opacity:1,stagger:.07,duration:.55,ease:'power2.out'}) },[active,entered])
  useEffect(()=>()=>{audio.current?.close()},[])
  const toggleSound=()=>{ if(sound){audio.current?.suspend();setSound(false);return}const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;const ctx=audio.current||new Ctx();audio.current=ctx; if(!ctx._doree){const osc=ctx.createOscillator(), filter=ctx.createBiquadFilter(), gain=ctx.createGain();osc.type='sine';osc.frequency.value=174.6;filter.type='lowpass';filter.frequency.value=400;gain.gain.value=.014;osc.connect(filter).connect(gain).connect(ctx.destination);osc.start();ctx._doree=true}ctx.resume();setSound(true)}
  const submitReservation=e=>{e.preventDefault();if(!name.trim()){setNotice('Por favor, indica un nombre para la reserva.');return}if(!time){setNotice('Elige una hora para tu visita.');return}setNotice('Tu mesa te espera a la hora dorada. Vista previa: esta reserva no se ha enviado.')}
  return <div className={`app theme-${drink.scene}`}>
    {!entered&&<div className="preloader"><div className="pre-top">L’Heure Dorée <span>Paris · Café de autor</span></div><div className="pre-center"><div className="pre-sun">✳</div><p>Un instante para saborear</p><strong>{progress<100?'Preparando la extracción...':'Listo para servir.'}</strong></div><div className="pre-bottom"><div className="pre-track"><span style={{width:`${progress}%`}}/></div><div className="pre-status"><span>{String(progress).padStart(2,'0')}%</span>{progress===100?<button onClick={()=>setEntered(true)}>Entrar al salón <span>↗</span></button>:<span>Cargando activos.</span>}</div></div></div>}
    <header className="header"><a href="#inicio" className="wordmark">L’Heure <em>Dorée</em><span className="mark-star">✳</span></a><nav><a href="#coleccion">La carte</a><a href="#historia">Notre histoire</a><button onClick={()=>{setPanel('reserve');setNotice('')}}>Réserver <span>↗</span></button></nav></header>
    <main id="inicio">
      <section className="hero" id="coleccion"><div className="ambient"><div className="arch arch-one"/><div className="arch arch-two"/><div className="sun-disc"/><div className="floor-line"/><div className="grain-overlay"/></div>
        <div className="hero-title"><span>Le temps d’un</span><strong>café<span className="period">.</span></strong></div>
        <div className={`cup-stage coffee-stage ${detail?'is-detail':''}`} onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--mx',`${((e.clientX-r.left)/r.width-.5)*18}px`);e.currentTarget.style.setProperty('--my',`${((e.clientY-r.top)/r.height-.5)*14}px`)}} onPointerLeave={e=>{e.currentTarget.style.setProperty('--mx','0px');e.currentTarget.style.setProperty('--my','0px')}}><div className="coffee-halo"/><img key={drink.image} src={drink.image} alt={drink.name} className="coffee-image"/><div className={`coffee-atmosphere ${drink.id==='cold'?'is-cold':''}`} aria-hidden="true"><i/><i/><i/></div></div>
        <div className="hero-bottom"><div className="drink-info" key={drink.id}><h1>{drink.name}</h1><p className="description">{drink.description}</p><div className="specs"><div><span>Origen</span><strong>{drink.origin}</strong></div><div><span>Notas</span><strong>{drink.notes}</strong></div><div><span>Tueste</span><strong>{drink.roast}</strong></div></div><button className="order-button" onClick={()=>{setPanel('order');setNotice('')}}>Ordenar esta taza <span>↗</span></button></div>
        <div className="hero-controls"><button onClick={()=>setDetail(!detail)}>{detail?'Volver al encuadre':'Acercar la bebida'} <span>◉</span></button></div></div>
        <div className="drink-selector" aria-label="Seleccionar bebida">{drinks.map((d,i)=><button key={d.id} className={i===active?'selected':''} onClick={()=>{setActive(i);setDetail(false)}} aria-pressed={i===active}><strong>{d.id==='cold'?'Cold brew':d.id==='latte'?'Latte':'Espresso'}</strong><span className="selector-dot">●</span></button>)}</div>
        <div className="side-rail"><button onClick={toggleSound} aria-label={sound?'Silenciar sonido ambiental':'Activar sonido ambiental'}>Sonido {sound?'activado':'silenciado'}</button></div>
      </section>
      <section className="manifesto"><h2>Una taza.<br/><em>Tres maneras de sentir el tiempo.</em></h2></section>
      <div className="chapters">{drinks.map((d,i)=><section className={`chapter chapter-${d.scene}`} key={d.id}><div className="chapter-art"/><div className="chapter-copy"><h2>{d.name}</h2><span>{d.notes}</span><small>{d.description}</small><button onClick={()=>{setActive(i);document.getElementById('coleccion')?.scrollIntoView({behavior:'smooth'})}}>Descubrir esta taza ↗</button></div><img className="chapter-product" src={d.image} alt={d.name}/></section>)}</div>
      <section className="story" id="historia"><div className="story-art"/><div className="story-copy"><h2>Hay horas que merecen durar un poco más.</h2><p>Entre la primera luz y el último reflejo, servimos café como se vive una tarde en París: con curiosidad, conversación y tiempo para quedarse.</p><p>Cada taza cambia el paisaje. Elige tu momento.</p><button onClick={()=>document.getElementById('coleccion')?.scrollIntoView({behavior:'smooth'})}>Explorar la carta <span>↗</span></button></div></section>
      <section className="closing"><div className="closing-inner"><h2>Nos vemos<br/><em>a la hora dorada.</em></h2><p>Un rincón, una taza y una pausa hecha a tu medida.</p><button onClick={()=>{setPanel('reserve');setNotice('')}}>Reservar un rincón <span>↗</span></button></div><div className="closing-orbit">✳</div></section>
    </main>
    <footer><span>L’Heure Dorée</span><span>Una experiencia conceptual de Yanax Studio</span><a href="#inicio">Volver arriba ↑</a></footer>
    {panel&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setPanel(null)}}><div className="modal" role="dialog" aria-modal="true" aria-label={panel==='reserve'?'Reservar mesa':'Ordenar bebida'}><button className="modal-close" onClick={()=>setPanel(null)} aria-label="Cerrar">×</button><p className="overline">L’Heure Dorée</p>{panel==='reserve'?<><h2>Elige tu rincón.</h2><p>La hora dorada empieza donde tú decidas.</p><form onSubmit={submitReservation}><label>Tu nombre<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre"/></label><label>Hora de llegada<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label><div className="corner-label">Tu rincón</div><div className="corners">{['Ventanal','Barra','Terraza'].map(c=><button type="button" key={c} className={corner===c?'active':''} onClick={()=>setCorner(c)}>{c}</button>)}</div><button className="modal-submit" type="submit">Continuar con {corner} ↗</button></form></>:<><h2>{drink.name}</h2><p>{drink.description}</p><div className="order-summary"><span>Tu elección</span><strong>{drink.name}</strong><span>{drink.notes}</span></div><button className="modal-submit" onClick={()=>setNotice('Tu taza está elegida. Vista previa: el pedido no se ha enviado.')}>Añadir a mi pedido ↗</button></>}{notice&&<p className="notice" role="status">{notice}</p>}</div></div>}
  </div>
}
export default App
