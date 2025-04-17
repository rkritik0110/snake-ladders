"use client"
import { useState, useEffect,Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import useWebSocket from '../../../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import SnakeCanvas from '@/components/SnakeCanvas';

 function JoinRoomContent() {
  interface Player {
    id: string;
    name: string;
    position: number;
    color: string;
  }
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  
  const [inputCode, setInputCode] = useState('');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://s-l-backend.onrender.com/';
  const { sendMessage, lastMessage } = useWebSocket(wsUrl);
 
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      
      switch (data.type) {
        case 'ROOM_JOINED':
          setRoomCode(data.room.code);
          setPlayers(data.room.players); 
          setPlayerId(data.playerId);
          setIsJoining(false);
          break;
        
        case 'PLAYER_JOINED':
          setPlayers(data.roomState.players); 
          break;
        
        case 'ERROR':
          setError(data.message);
          setIsJoining(false);
          break;
          
        case 'GAME_STARTED':
          router.push(`/game?code=${roomCode}&playerId=${playerId}`);
          break;
      }
    }
  }, [lastMessage, router, roomCode, playerId]);

  const handleJoinRoom = () => {
    if (!inputCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    setIsJoining(true);
    setError('');
    
    sendMessage(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode: inputCode.trim().toUpperCase(),
      playerName: name,
      color: getRandomColor()
    }));
  };

  function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }


  if (isJoining) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
       
        <div className="border-2 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Joining game...</h1>
          <p className="text-gray-600">Please wait</p>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
      </div>
    );
  }
  if (roomCode) {
    return (
      <motion.div 
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      ><motion.div 
      className="absolute z-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.8 }}
      transition={{ duration: 2.5 }}
    >
      <SnakeCanvas />
    </motion.div>
  
     
        <motion.div 
          className="border-2 p-8 rounded-lg shadow-lg w-full max-w-md bg-white/10 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 80,
            damping: 12,
            delay: 0.2,
            duration: 0.6
          }}
          whileHover={{ 
            boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.3)",
            y: -4,
            transition: { type: "spring", stiffness: 150, damping: 15 }
          }}
        >
          <motion.h1 
            className="text-2xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Waiting Room
          </motion.h1>
          
          <motion.div 
            className="mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="text-lg font-medium">Room Code:</p>
            <motion.div 
              className="mt-2 p-3 bg-neutral-700 rounded-md flex items-center justify-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <motion.span 
                className="text-2xl font-bold tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 1, duration: 0.5 }
                }}
              >
                {roomCode}
              </motion.span>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <h2 className="text-lg font-medium mb-2">Players ({players.length}):</h2>
            <ul className="space-y-2">
              {players.map((player, index) => (
                <motion.li 
                  key={player.id} 
                  className="p-2 rounded-md flex items-center  bg-neutral-700/50 backdrop-blur-sm border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 1.4 + (index * 0.1), 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 1.5 + (index * 0.1),
                      type: "spring",
                      stiffness: 300,
                      damping: 10
                    }}
                    style={{ backgroundColor: player.color }} 
                    className="w-4 h-4 rounded-full mr-2"
                  ></motion.div>
                  <span>{player.name}</span>
                  {player.id === playerId && (
                    <motion.span 
                      className="ml-2 text-xs text-gray-500 bg-"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6 + (index * 0.1), duration: 0.3 }}
                    >
                      (You)
                    </motion.span>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.p 
            className="text-center text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
           
          >
            Waiting for the host to start the game...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
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
          scale: 1.02,
          transition: { type: "spring", stiffness: 150, damping: 15 }
        }}
      >
        {/* Title with staggered character animation */}
        <motion.div className="overflow-hidden">
          <motion.h1 
            className="text-3xl font-bold text-center mb-6 text-white"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {"Join a Game".split('').map((char, index) => (
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
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.label 
            htmlFor="code" 
            className="block text-sm font-medium text-white mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5, ease: "easeOut" }}
          >
            Room Code
          </motion.label>
  
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
          >
            <motion.input
              type="text"
              id="code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-white/30 bg-white/20 backdrop-blur-sm text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter room code"
              maxLength={6}
              whileFocus={{ 
                scale: 1.02,
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
                transition: { type: "spring", stiffness: 300, damping: 15 }
              }}
              animate={
                inputCode 
                  ? { borderColor: "#60a5fa", borderWidth: "2px" }
                  : {}
              }
            />
          </motion.div>
  
          {error && (
            <motion.p 
              className="mt-2 text-sm text-red-300 font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ 
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.3
                }
              }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 100 }}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94, transition: { duration: 0.1 } }}
          >
            <Button
              onClick={handleJoinRoom}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <motion.span
                initial={{ opacity: 1 }}
                animate={
                  inputCode 
                    ? { 
                        scale: [1, 1.05, 1],
                        transition: { 
                          repeat: Infinity, 
                          repeatType: "reverse", 
                          duration: 1.5,
                          ease: "easeInOut",
                          repeatDelay: 0.5
                        }
                      } 
                    : {}
                }
                className="inline-flex items-center justify-center"
              >
                <motion.span
                  initial={false}
                  animate={
                    inputCode 
                      ? { 
                         
                          backgroundSize: "200% 100%",
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                          transition: { 
                            duration: 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 0.5
                          }
                        }
                      : {}
                  }
                  className="relative"
                >
                  Join Game
                </motion.span>
              </motion.span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function JoinRoom() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinRoomContent />
    </Suspense>
  );
}