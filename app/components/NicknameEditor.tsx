import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

interface NicknameEditorProps {
  nickname: string;
  setNickname: (nickname: string) => void;
  maxLength: number;
}

const NicknameEditor: React.FC<NicknameEditorProps> = ({ nickname, setNickname, maxLength }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempNickname, setTempNickname] = useState(nickname);

  const handleUpdate = () => {
    if (tempNickname.length >= 3 && tempNickname.length <= maxLength) {
      setNickname(tempNickname);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="
          bg-gradient-to-r from-gray-800 to-gray-900
          text-white text-lg font-semibold py-2 px-4 rounded-md
          hover:from-gray-700 hover:to-gray-800
          transition-all duration-300 ease-in-out
          transform hover:scale-102 hover:shadow-md
          border border-gray-700
        "
      >
        {nickname}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-black text-white rounded-2xl shadow-2xl overflow-hidden">
          <h2 className="text-xl font-bold mb-4">Edit Nickname</h2>
          <input
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            maxLength={maxLength}
            className="bg-gray-800 text-white border-gray-700 w-full p-2 rounded"
          />
          <p className="text-sm text-gray-400 mt-2">
            {tempNickname.length}/20 characters (minimum 3)
          </p>
          <DialogFooter>
            <Button 
              onClick={handleUpdate} 
              className="bg-white text-black hover:bg-gray-200"
              disabled={tempNickname.length < 3}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NicknameEditor;
