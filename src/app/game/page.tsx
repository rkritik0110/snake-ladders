"use client"
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {motion} from "framer-motion"
import useWebSocket, { ReadyState } from '../../../hooks/useWebSocket';
import GameBoard from '../../components/GameBoard';



 function GameContent() {
  interface Player {
    id: string;
    name: string;
    position: number;
    color: string;
  }
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get('code');
  const playerId = searchParams.get('playerId');
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [gameState, setGameState] = useState<string>('inactive');
  const [winner, setWinner] = useState<string | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState('');
  const [boardSize, setBoardSize] = useState(100);
  const [snakesAndLadders, setSnakesAndLadders] = useState<{[key: number]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://s-l-backend.onrender.com/';
  const { sendMessage, lastMessage, readyState } = useWebSocket(wsUrl);
  
  const [isMyTurn,setIsMyTurn] =useState(false);

 
  useEffect(() => {
    if (readyState === ReadyState.OPEN && code) {
      sendMessage(JSON.stringify({
        type: 'GET_ROOM_STATE',
        roomCode: code,
        playerId: playerId
      }));
    }
  }, [readyState, code, playerId, sendMessage]);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log('Received message:', data);
        
        switch (data.type) {
          case 'ROOM_STATE':
          case 'ROOM_JOINED':
            setPlayers(data.room.players);
            setCurrentTurn(data.room.currentTurn);
            setGameState(data.room.gameState);
            setWinner(data.room.winner);
            setSnakesAndLadders(data.room.snakesAndLadders || {});
            setBoardSize(data.room.boardSize || 100);
            setIsLoading(false);
            setError(''); 
            break;
            
          case 'PLAYER_JOINED':
            
            setPlayers(data.roomState.players);
            setGameState(data.roomState.gameState); 
            break;
            
          case 'GAME_STARTED':
            setGameState(data.roomState.gameState);
            setCurrentTurn(data.roomState.currentTurn);
            setError(''); 
            break;
            
          case 'PLAYER_MOVED':
            setPlayers(prevPlayers => 
              prevPlayers.map(player => 
                player.id === data.playerId 
                  ? { ...player, position: data.newPosition } 
                  : player
              )
            );
            setDiceValue(data.diceValue);
            setCurrentTurn(data.nextTurn);
            setGameState(data.gameState);
            setWinner(data.winner);
            setIsRolling(false);
            setError(''); 
            break;
          
          case 'PLAYER_LEFT':
            setPlayers(data.roomState.players);
            setCurrentTurn(data.roomState.currentTurn);
            setGameState(data.roomState.gameState); 
            break;
          
          case 'GAME_RESET':
            setPlayers(data.roomState.players);
            setCurrentTurn(data.roomState.currentTurn);
            setGameState(data.roomState.gameState);
            setWinner(data.roomState.winner);
            setDiceValue(null);
            setError(''); 
            break;
          
          case 'ERROR':
            setError(data.message);
            setIsRolling(false);
            break;
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
        setError("Communication error");
        setIsRolling(false);
      }
    }
  }, [lastMessage]);
  useEffect(() => {
    if (players.length > 0 && currentTurn >= 0 && currentTurn < players.length) {
      const currentPlayer = players[currentTurn];
      setIsMyTurn(currentPlayer?.id === playerId);
    } else {
      setIsMyTurn(false);
    }
  }, [players, currentTurn, playerId]);

  const handleRollDice = () => {
    if (!isMyTurn|| gameState !== 'playing' || isRolling) {
      console.log("Can't roll:", { isMyTurn, gameState, isRolling });
      return;
    }
    
    setIsRolling(true);
    sendMessage(JSON.stringify({
      type: 'ROLL_DICE',
      playerId: playerId  
    }));
    setTimeout(() => {
      setIsRolling(prev => {
        if (prev) {
          setError("No response from server. Try again.");
          return false;
        }
        return prev;
      });
    }, 5000);
  };

  const handleStartGame = () => {
    if (players.length < 2) {
      setError("Need at least 2 players to start");
      return;
    }
    
    sendMessage(JSON.stringify({
      type: 'START_GAME',
      playerId: playerId  
    }));
  };

  const handleResetGame = () => {
    sendMessage(JSON.stringify({
      type: 'RESET_GAME',
      playerId: playerId  
    }));
  };

  const handleExitGame = () => {
    router.push('/');
  };

  if (readyState !== ReadyState.OPEN || isLoading) {
    return (
      <div className="min-h-screen  border-2 flex flex-col items-center justify-center p-4">
        <div className=" p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Connecting to game...</h1>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-4 mx-auto bg-cover bg-center bg-no-repeat rounded-2xl" style={{ backgroundImage: "url('bg1.png')" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
       
              <motion.div 
                className="lg:col-span-1 border-5 border-amber-50 p-4 rounded-md bg-center"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  delay: 0.2
                }}
              >
                <motion.div 
                  className="p-4 rounded-lg shadow-lg mb-4 backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <h2 className="text-xl font-bold mb-3">Game Info</h2>
                  <motion.div 
                    className="mb-3 border-2 rounded-md p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-gray-600">Room Code:</p>
                    <p className="text-lg font-semibold">{code}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="mb-3 border-2 rounded-md p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-sm text-gray-600">Status:</p>
                    <p className="text-lg font-semibold capitalize">{gameState}</p>
                  </motion.div>
                  
                  {winner && (
                    <motion.div 
                      className="mb-3 border-2 rounded-md p-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300,
                        damping: 15
                      }}
                    >
                      <p className="text-sm text-gray-600">Winner:</p>
                      <p className="text-lg font-semibold">
                        {players.find(p => p.id === winner)?.name || 'Unknown'}
                      </p>
                    </motion.div>
                  )}
                  
                  {diceValue && (
                    <motion.div 
                      className="mb-3 border-2 rounded-md p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-sm text-gray-600">Last Roll:</p>
                      <div className="flex items-center">
                        <motion.div 
                          className="w-12 h-12 border-2 border-red-700 text-gray-600 bg-white rounded-lg flex items-center justify-center text-xl font-bold"
                          initial={{ rotate: 0 }}
                          animate={isRolling ? { 
                            rotate: [0, 360, 720, 1080],
                            scale: [1, 1.2, 0.9, 1.1, 1],
                          } : { rotate: 0 }}
                          transition={isRolling ? { 
                            duration: 1.5,
                            ease: "easeInOut"
                          } : {}}
                        >
                          {diceValue}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {gameState === 'waiting' && (
                      <motion.button
                        onClick={handleStartGame}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mb-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        Start Game
                      </motion.button>
                    )}
                    
                    {gameState === 'playing' && (
                      <motion.button
                        onClick={handleRollDice}
                        disabled={!isMyTurn || isRolling}
                        className={`w-full py-2 px-4 rounded-md text-white mb-2 ${
                          !isMyTurn || isRolling
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        whileHover={isMyTurn && !isRolling ? { scale: 1.05 } : {}}
                        whileTap={isMyTurn && !isRolling ? { scale: 0.95 } : {}}
                        animate={isMyTurn && !isRolling ? { 
                          scale: [1, 1.05, 1],
                          transition: { repeat: Infinity, repeatType: "reverse", duration: 1.5 }
                        } : {}}
                      >
                        {isRolling ? 'Rolling...' : 'Roll Dice'}
                      </motion.button>
                    )}
                    
                    {gameState === 'finished' && (
                      <motion.button
                        onClick={handleResetGame}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mb-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Play Again
                      </motion.button>
                    )}
  
                    {gameState === 'inactive' && players.length >= 2 && (
                      <motion.button
                        onClick={handleStartGame}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mb-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Start Game
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={handleExitGame}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Exit Game
                    </motion.button>
                  </motion.div>
                  
                  {error && (
                    <motion.p 
                      className="mt-4 text-sm text-red-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>
  
                <motion.div 
                  className="border-2 p-4 rounded-lg shadow-lg backdrop-blur-sm"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 100, 
                    damping: 15,
                    delay: 0.4
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h2 className="text-xl font-bold mb-3">Players ({players.length})</h2>
                  {players.length === 0 ? (
                    <p className="text-gray-600">No players in the room</p>
                  ) : (
                    <ul className="space-y-3">
                      {players.map((player, index) => (
                        <motion.li 
                          key={player.id} 
                          className={`p-3 rounded-md flex items-center ${
                            currentTurn === index ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-50'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.03 }}
                        >
                          <motion.div 
                            style={{ backgroundColor: player.color }} 
                            className="w-4 h-4 rounded-full mr-2"
                            animate={currentTurn === index ? { 
                              scale: [1, 1.3, 1],
                              transition: { 
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 1.5 
                              }
                            } : {}}
                          ></motion.div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{player.name}</span>
                            {player.id === playerId && <span className="ml-1 text-xs text-gray-500">(You)</span>}
                            <div className="text-sm text-gray-600">
                              Position: {player.position}
                            </div>
                          </div>
                          {currentTurn === index && (
                            <motion.div 
                              className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full"
                              animate={{ 
                                scale: [1, 1.1, 1],
                                transition: {
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                  duration: 1.2
                                }
                              }}
                            >
                              Current Turn
                            </motion.div>
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </motion.div>
             
              {/* Game Board with enhanced animations */}
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.6
                }}
              >
                <motion.div
                  className="border-3 border-amber-50 rounded-lg shadow-lg bg-cover bg-center mt-10 mr-5"
                  style={{ backgroundImage: "url('/grass.jpg')", height: "670px", width: "670px" }}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 50,
                    damping: 15,
                    delay: 0.8
                  }}
                  whileHover={{ 
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  <GameBoard 
                    players={players} 
                    boardSize={boardSize}
                    snakesAndLadders={snakesAndLadders}
                    currentPlayerId={playerId as string}
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function Game() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
   <GameContent/>
    </Suspense>
  );
}