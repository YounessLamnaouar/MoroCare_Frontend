import React from 'react';
import background from '../assets/landing2.png'
import Magnet from '../reactBits/Magnet';
import TextPressure from '../reactBits/TextPressure';
import SplitText from '../reactBits/SplitText';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="relative bg-cover bg-top min-h-[90vh] flex items-center" style={{ backgroundImage: `url(${background})` }}>
        <div className="max-w-7xl ms-[5vw] mt-[30vh] px-4 text-left space-y-6">
        <TextPressure
                text="MoroCare!"
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#155B5F"
                strokeColor="#ff0000"
                minFontSize={36}
            />
        <SplitText
            text="Your Health, Your Comfort, Your Future"
            className="text-2xl font-semibold text-center text-teal-800"
            delay={50}
            animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
            animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
            easing="easeOutCubic"
            threshold={0.2}
            rootMargin="-50px"
            />
            <p className="text-lime-900 max-w-lg mt-4">
                At MoroCare, we are dedicated to making healthcare more accessible, efficient, and patient-centered. 
                Connect with top medical professionals, book appointments, and access teleconsultations — anytime, anywhere.
            </p>
        <div className="mt-6 flex gap-4">
            <Magnet padding={100} disabled={false} magnetStrength={50}>
                <Link className="cursor-pointer bg-teal-800 hover:bg-teal-950 text-white font-bold py-3 px-6 rounded-md transition" to={'/services'}>Get Started</Link>
            </Magnet>
        </div>
        </div>
    </section>

    </>
  );
}