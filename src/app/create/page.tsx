"use client"
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from "framer-motion";
import useWebSocket, { ReadyState } from '../../../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import SnakeCanvas from '@/components/SnakeCanvas';

 function CreateRoomContent() {
  interface Player {
    id: string;
    name: string;
    position: number;
    color: string;
  }
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://s-l-backend.onrender.com/';
  const { sendMessage, lastMessage, readyState } = useWebSocket(wsUrl);


  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting...',
    [ReadyState.OPEN]: 'Connected',
    [ReadyState.CLOSING]: 'Closing...',
    [ReadyState.CLOSED]: 'Disconnected',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];


  useEffect(() => {
    if (readyState === ReadyState.OPEN && name) {
      sendMessage(JSON.stringify({
        type: 'CREATE_ROOM',
        playerName: name,
        color: getRandomColor()
      }));
    }
  }, [readyState, name, sendMessage]);


  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      
      switch (data.type) {
        case 'ROOM_CREATED':
          setRoomCode(data.room.code);
          setPlayers(data.room.players);
          setPlayerId(data.playerId);
          break;
        
        case 'PLAYER_JOINED':
          setPlayers(data.roomState.players);
          break;
        
        case 'ERROR':
          setError(data.message);
          break;
          
        case 'GAME_STARTED':
            router.push(`/game?code=${roomCode}&playerId=${playerId}`);

          break;
      }
    }
  }, [lastMessage, router, roomCode, playerId]);

  const handleStartGame = () => {
    if (players.length < 2) {
      setError('Need at least 2 players to start');
      return;
    }
    
    sendMessage(JSON.stringify({
      type: 'START_GAME'
    }));
  };

  function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }


  if (!roomCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
       
        <div className=" p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Setting up your game...</h1>
          <p className="text-gray-600">{connectionStatus}</p>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1
        }}
        transition={{ 
          duration: 1.2,
          ease: "easeOut"
        }}
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-500"
      >
      
        <motion.div 
          className="absolute z-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 2.5 }}
        >
          <SnakeCanvas />
        </motion.div>
      

        <motion.div 
          className="relative z-10 p-8 rounded-lg shadow-lg w-full max-w-md bg-white/10 backdrop-blur-sm border-2 border-white/30"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 80,
            damping: 12,
            delay: 0.4,
            duration: 0.8
          }}
          whileHover={{ 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            y: -8,
            transition: { type: "spring", stiffness: 150, damping: 15 }
          }}
        >
    
          <motion.div className="overflow-hidden">
            <motion.h1 
              className="text-3xl font-bold text-center mb-6 text-white"
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {"Waiting Room".split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.8 + index * 0.05,
                    duration: 0.4,
                    ease: "easeOut" 
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>
          </motion.div>
          
          <motion.div 
            className="mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.p 
              className="text-lg font-medium text-white"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
            >
              Room Code:
            </motion.p>
            
            <motion.div 
              className="mt-3 flex items-center justify-center gap-3"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, type: "spring", stiffness: 100 }}
            >
              <motion.span 
                className="bg-neutral-700/80 rounded-md text-2xl font-bold tracking-wider p-3 text-white border border-white/20"
                initial={{ scale: 0.95 }}
                animate={{ 
                  scale: [0.95, 1],
                  backgroundColor: ["rgba(38, 38, 38, 0.8)", "rgba(64, 64, 64, 0.8)", "rgba(38, 38, 38, 0.8)"],
                  boxShadow: [
                    "0 0 0 rgba(255, 255, 255, 0)",
                    "0 0 15px rgba(255, 255, 255, 0.3)",
                    "0 0 0 rgba(255, 255, 255, 0)"
                  ]
                }}
                transition={{ 
                  scale: { delay: 1.5, duration: 0.5, ease: "easeOut" },
                  backgroundColor: { 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 3,
                    ease: "easeInOut"
                  },
                  boxShadow: {
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 3,
                    ease: "easeInOut"
                  }
                }}
              >
                {roomCode}
              </motion.span>
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
              >
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(roomCode);
                    alert('Room code copied to clipboard!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-700/30"
                >
                  Copy
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="mt-3 text-sm text-blue-100/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.6 }}
            >
              Share this code with friends to join your game
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <motion.h2 
              className="text-lg font-medium mb-3 text-white"
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.9, duration: 0.4 }}
            >
              Players ({players.length}):
            </motion.h2>
            
            <motion.ul className="space-y-2">
              {players.map((player, index) => (
                <motion.li 
                  key={player.id} 
                  className="p-3 rounded-md flex items-center bg-neutral-700/50 backdrop-blur-sm border border-white/10"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ 
                    delay: 2 + (index * 0.15),
                    type: "spring",
                    stiffness: 70,
                    damping: 12
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    backgroundColor: "rgba(82, 82, 82, 0.5)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div 
                    style={{ backgroundColor: player.color }} 
                    className="w-5 h-5 rounded-full mr-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 2.1 + (index * 0.15),
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                    whileHover={{ 
                      scale: 1.3, 
                      boxShadow: `0 0 10px ${player.color}`,
                      transition: { duration: 0.2 }
                    }}
                  ></motion.div>
                  
                  <span className="text-white font-medium">{player.name}</span>
                  
                  {player.id === playerId && (
                    <motion.span 
                      className="ml-2 text-xs bg-blue-600/60 rounded-full px-2 py-0.5 text-white"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: 2.2 + (index * 0.15),
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      You
                    </motion.span>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          
          {error && (
            <motion.div 
              className="mb-4 bg-red-500/20 border border-red-500/30 rounded-md p-2 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ 
                opacity: 1,
                y: 0
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.p 
                className="text-red-200"
                animate={{ 
                  scale: [1, 1.03, 1]
                }}
                transition={{
                  duration: 0.5,
                  repeat: 1,
                  repeatType: "reverse"
                }}
              >
                {error}
              </motion.p>
            </motion.div>
          )}
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 2.3, 
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            <motion.button
              onClick={handleStartGame}
              disabled={players.length < 2}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                players.length < 2 
                  ? 'bg-gray-500/50 cursor-not-allowed border border-gray-400/30' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border border-green-400/30'
              }`}
              animate={players.length >= 2 ? {
                boxShadow: [
                  "0 0 0 rgba(74, 222, 128, 0)",
                  "0 0 20px rgba(74, 222, 128, 0.4)",
                  "0 0 0 rgba(74, 222, 128, 0)"
                ]
              } : {}}
              transition={{
                boxShadow: {
                  repeat: players.length >= 2 ? Infinity : 0,
                  repeatType: "reverse",
                  duration: 2,
                  delay: 0.5
                }
              }}
              whileHover={players.length >= 2 ? { 
                scale: 1.03,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              } : {}}
              whileTap={players.length >= 2 ? { scale: 0.97 } : {}}
            >
              {players.length < 2 ? (
                "Waiting for Players..."
              ) : (
                <motion.span
                  animate={players.length >= 2 ? {
                    scale: [1, 1.03, 1],
                  } : {}}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.5,
                    repeatDelay: 0.5
                  }}
                >
                  Start Game
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default function CreateRoom() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <CreateRoomContent/>
    </Suspense>
  );
}