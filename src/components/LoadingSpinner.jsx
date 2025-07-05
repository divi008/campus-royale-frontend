import React from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple spinning coin animation data (JSON)
const coinAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Spinning Coin",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Coin",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 100},
        "r": {
          "a": 1,
          "k": [
            {
              "i": {"x": [0.833], "y": [0.833]},
              "o": {"x": [0.167], "y": [0.167]},
              "t": 0,
              "s": [0]
            },
            {
              "t": 60,
              "s": [360]
            }
          ]
        },
        "p": {"a": 0, "k": [100, 100, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {"a": 0, "k": [100, 100, 100]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": {"a": 0, "k": [80, 80]},
              "p": {"a": 0, "k": [0, 0]}
            },
            {
              "ty": "fl",
              "c": {
                "a": 0,
                "k": [1, 0.843, 0, 1]
              },
              "o": {"a": 0, "k": 100}
            },
            {
              "ty": "tr",
              "p": {"a": 0, "k": [0, 0]},
              "a": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [100, 100]},
              "r": {"a": 0, "k": 0},
              "o": {"a": 0, "k": 100}
            }
          ]
        }
      ]
    }
  ]
};

const LoadingSpinner = ({ isVisible, message = "Loading..." }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="text-center"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Lottie Animation */}
            <div className="relative mb-4">
              <div className="w-24 h-24 mx-auto">
                <Lottie
                  animationData={coinAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              {/* Fallback CSS animation if Lottie fails */}
              <div className="absolute inset-0 w-24 h-24 mx-auto animate-spin opacity-0">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-gold via-yellow-400 to-gold border-4 border-gold shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400 via-gold to-yellow-400 animate-pulse"></div>
                </div>
              </div>
              {/* Casino chip effect */}
              <div className="absolute inset-0 w-24 h-24 mx-auto animate-ping">
                <div className="w-full h-full rounded-full border-2 border-gold opacity-20"></div>
              </div>
            </div>
            
            {/* Loading text */}
            <motion.div 
              className="text-gold font-bold text-lg animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {message}
            </motion.div>
            
            {/* Dots animation */}
            <motion.div 
              className="flex justify-center mt-2 space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingSpinner; 