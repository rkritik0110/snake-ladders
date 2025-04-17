"use client"

import React, { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import {motion} from "framer-motion"


export default function  Hero(){
    const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;}
    router.push(`/create?name=${encodeURIComponent(playerName)}`);
  };
  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;}
    router.push(`/join?name=${encodeURIComponent(playerName)}`);
  };
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
  
      
      <motion.img 
        src="/bg.png" 
        alt="Background" 
        className="w-1/2 h-auto p-4 rounded-xl"
        initial={{ opacity: 0, scale: 0.7, rotateY: -30 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          filter: ["brightness(0.9)", "brightness(1.05)", "brightness(1)"]
        }}
        transition={{ 
          type: "spring",
          stiffness: 50,
          damping: 15,
          delay: 0.3,
          filter: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }
        }}
        whileHover={{ 
          scale: 1.05,
          rotateY: 5,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          transition: { type: "spring", stiffness: 150, damping: 12 }
        }}
      />
        
      <motion.div 
        className="border-2 p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-sm bg-white/80"
        initial={{ opacity: 0, scale: 0.6, rotateY: 30 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 60, 
          damping: 12,
          delay: 0.5
        }}
        whileHover={{ 
          boxShadow: "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
          y: -8,
          transition: { type: "spring", stiffness: 120, damping: 15 }
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <motion.h1 
            className="text-3xl font-bold text-center mb-6 relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 80,
              damping: 10,
              delay: 0.9
            }}
          >
            {/* Snake Character */}
            <motion.span
              className="absolute -left-2 -top-8 text-4xl transform -rotate-12 origin-bottom-right"
              initial={{ opacity: 0, rotate: -30, x: -20 }}
              animate={{ opacity: 1, rotate: -12, x: 0 }}
              transition={{ 
                delay: 1.3,
                type: "spring",
                stiffness: 120,
                damping: 8
              }}
            >
              🐍
            </motion.span>
            
            {/* Each letter animated individually */}
            <motion.div className="flex justify-center text-black ">
              {"Snakes and Ladders".split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1 + index * 0.05,
                    type: "spring",
                    stiffness: 150,
                    damping: 10
                  }}
                  className="inline-block text-black"
                  whileHover={{
                    scale: 1.3,
                    rotate: Math.random() * 20 - 10,
                    color: ["#000", "#4f46e5", "#16a34a", "#ea580c"][Math.floor(Math.random() * 4)],
                    transition: { duration: 0.2 }
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>
            
            <motion.span
              className="absolute -right-2 -top-8 text-4xl transform rotate-12 origin-bottom-left"
              initial={{ opacity: 0, rotate: 30, x: 20 }}
              animate={{ opacity: 1, rotate: 12, x: 0 }}
              transition={{ 
                delay: 1.3,
                type: "spring",
                stiffness: 120,
                damping: 8
              }}
            >
              🪜
            </motion.span>
          </motion.h1>
        </motion.div>
  
        <motion.div 
          className="mb-4 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 80,
            damping: 15,
            delay: 1.5
          }}
        >
          <motion.div 
            className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            👤
          </motion.div>
          
          <motion.input
            type="text"
            id="name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-3 pl-10 border-2 border-gray-300 rounded-xl focus:outline-none bg-purple-300 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            initial={{ borderColor: "rgba(209, 213, 219, 1)" }}
            whileFocus={{ 
              scale: 1.02,
              boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.3)",
              borderColor: "#3b82f6", 
              transition: { type: "spring", stiffness: 300, damping: 15 }
            }}
            animate={playerName ? { 
              borderColor: "#3b82f6",
              transition: { duration: 0.3 }
            } : {}}
          />
          
          {error && (
            <motion.p 
              className="mt-1 text-sm text-red-600 font-medium"
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: [1, 1.05, 1]
              }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>
  
        <motion.div 
          className="flex flex-col items-center justify-center space-y-4 mt-8 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 70,
            damping: 15,
            delay: 1.8
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="relative w-full max-w-md mx-auto"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 flex items-center justify-center"
              variants={{
                idle: { opacity: 0 },
                hover: { opacity: 1 }
              }}
              initial="idle"
              whileHover="hover"
              transition={{ duration: 0.3 }}
            />
            
            <Button 
              onClick={handleCreateRoom} 
              className="relative z-10 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl shadow-lg w-full"
            >
              <motion.div className="flex items-center justify-center">
                <motion.span
                  className="mr-2 text-lg"
                  animate={playerName ? { 
                    scale: [1, 1.1, 1],
                    transition: { 
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 1.5
                    }
                  } : {}}
                >
                  🎮
                </motion.span>
                <motion.span
                  animate={playerName ? { 
                    fontWeight: ["normal", "bold", "normal"],
                    transition: { 
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 2
                    }
                  } : {}}
                >
                  Create New Game
                </motion.span>
              </motion.div>
              
              <motion.div 
                className="absolute inset-0 bg-white opacity-20 rounded-xl" 
                initial={{ x: "-100%" }}
                whileHover={{ 
                  x: "100%",
                  transition: { repeat: Infinity, duration: 0.8 }
                }}
              />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="relative w-full max-w-md mx-auto"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0"
              variants={{
                idle: { opacity: 0 },
                hover: { opacity: 1 }
              }}
              initial="idle"
              whileHover="hover"
              transition={{ duration: 0.3 }}
            />
            
            <Button 
              onClick={handleJoinRoom}
              className="relative z-10 overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl shadow-lg w-full"
            >
              <motion.div className="flex items-center justify-center">
                <motion.span 
                  className="mr-2 text-lg"
                  whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                >
                  🔍
                </motion.span>
                <span>Join Existing Game</span>
              </motion.div>
              
              <motion.div 
                className="absolute inset-0 bg-black opacity-20 rounded-xl" 
                initial={{ x: "-100%" }}
                whileHover={{ 
                  x: "100%",
                  transition: { repeat: Infinity, duration: 0.8 }
                }}
              />
            </Button>
          </motion.div>
        </motion.div>
  
     
        <motion.div
          className="absolute -bottom-6 -right-6 text-4xl"
          initial={{ opacity: 0, rotate: -30, scale: 0 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ 
            delay: 2.2,
            type: "spring",
            stiffness: 150,
            damping: 8
          }}
          whileHover={{ 
            rotate: 360,
            scale: 1.2,
            transition: { duration: 0.6 }
          }}
        >
          🎲
        </motion.div>
      </motion.div>
    </motion.div>
  );
}