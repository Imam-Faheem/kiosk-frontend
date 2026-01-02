#ifndef	__K720_DLL_H
#define	__K720_DLL_H

///////////////////预定义公共错误///////////////////////////
#define	Bad_CommOpen			-101//串口未打开
#define	Bad_CommSet				-102//串口设置错误

#define	Bad_CommTimeouts		-999//串口读写超时设置错误
#define	Bad_CommQueue			-998//串口缓冲区操作错误

///////////////////串口的读写的错误/////////////////////////
#define	Bad_CommRead			-103//串口读超时
#define	Bad_CommWrite			-104//串口写超时
#define	ACK_Timeout				-105//串口ACK标识超时
#define	EOT_Timeout				-106//串口Eot标识超时
#define	PACKET_Timeout			-107//最后一包数据超时
#define	WRONG_PacketHead		-108//错误的包头 
#define	WRONG_PacketLen			-109//错误的包的长度
#define WRONG_BCC				-110//BBC校验错误
#define Bad_Parameter			-201//传入函数的参数错误
#define	Bad_CommClose			-202//关闭串口错误
#define WRONG_ADDRESS			-203//错误地址

#define NOHIDDEVICE				-301
#define OPENHIDHANDLEFAILED		-302
#define HIDDEVICEHASCLOSED		-303
#define CLOSEHIDDEVICEFAILED	-304
#define SENDDATATIMEOUT         -305
#define RECEIVEDATATIMEOUT		-306
#define RECEIVEACKTIMEOUT		-309
#define HIDDEVICEHASOOPENED		-307
#define WRONGBAGHEAD			-308
#define SENDENQTIMEOUT			-310
#define ACKERR					-311

#define CardBoxEmpty			0xA0//发卡箱已空，不能发卡
#define CardBoxFull				0xA1//发卡箱已满，不能回收卡片到发卡箱
#define RetainBoxFull			0xA2//回收箱已满，不能回收到回收箱
#define HaveCard				0xA3//通道有卡，不能做发卡动作
#define HaveNoCard				0xA4//通道无卡，不能做弹卡、回收等动作
#define MoveCardTimeOut			0xA5//卡片移动超时，包括发卡、弹卡、回收等动作
#define EnterCardTimeOut		0xA6//回收到发卡箱时，前端进卡超时

#define SendCard_Time			15000//发卡超时时间
#define EjectCard_Time			8000//弹卡超时时间
#define RetainCard_Time			4000//回收超时时间
#define retain_check_timeout	2500

//设备状态
#define IDLE					0x30//空闲
#define FAULT					0x31//设备故障
#define READY_FAILED			0x32//准备卡失败
#define SENDINGCARD				0x33//正在发卡
#define RETAININGCARD			0x34//正在收卡
#define SENDCARD_FAILED			0x35//发卡出错
#define RETAINCARD_FAILED		0x36//收卡出错

//通道状态
#define OVERLAP					0x30//重叠卡
#define JAM						0x31//堵塞
#define MEDIAPRESENT			0x32//读卡位有卡
#define MEDIANOTPRESENT			0x33//通道无卡
#define MEDIAENTERING			0x34//前端有卡

//卡箱状态
#define CARDBOXEMPTY			0x30//卡空
#define CARDBOXLESS				0x31//预空、少卡
#define CARDBOXMORE				0x32//足卡
#define CARDBOXNOTFULL			0x33//预满
#define CARDBOXFULL				0x34//已满

//卡箱状态
#define RETAINBOXNOTFULL		0x30//未满
#define RETAINBOXFULL			0x31//已满

#ifdef __cplusplus
extern "C"
{
#endif
	/////////////////RF610串口操作/////////////////////////////////////
	HANDLE __stdcall K720_CommOpen(char *Port);
	HANDLE __stdcall K720_CommOpenWithBaud(char *Port, unsigned int _data);
	int __stdcall K720_CommClose(HANDLE ComHandle);
	int __stdcall K720_GetSysVersion(HANDLE ComHandle, char *strVersion);

	///////////////////////////波特率操作函数///////////////////////////////////
	//int __stdcall K720_SetCommBaud(HANDLE ComHandle, unsigned int _Baud, char *RecordInfo);
	//int __stdcall K720_Reset(HANDLE ComHandle, char *RecordInfo);
	//int __stdcall K720_GetHardVersion(HANDLE ComHandle, BYTE *_VerCode, char *RecordInfo);

	/////////////////RF610 S50卡片操作函数////////////////////////////
	int __stdcall K720_AutoTestRFIDCard(HANDLE ComHandle, BYTE MacAddr, BYTE* cardtype, char *RecordInfo);
	int __stdcall K720_S50DetectCard(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);
	int __stdcall K720_S50GetCardID(HANDLE ComHandle, BYTE MacAddr, BYTE *_CardID, char *RecordInfo);
	int __stdcall K720_S50LoadSecKey(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE _KEYType, BYTE *_KEY, char *RecordInfo);
	int __stdcall K720_S50ReadBlock(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_BlockData, char *RecordInfo);
	int __stdcall K720_S50WriteBlock(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr,BYTE *_BlockData, char *RecordInfo);
	int __stdcall K720_S50InitValue(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data, char *RecordInfo);
	int __stdcall K720_S50Increment(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data, char *RecordInfo);
	int __stdcall K720_S50Decrement(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data, char *RecordInfo);
	int __stdcall K720_S50Halt(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);

	//////////////////////////////RF610 S70卡片操作函数////////////////////////////
	int __stdcall K720_S70DetectCard(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);
	int __stdcall K720_S70GetCardID(HANDLE ComHandle, BYTE MacAddr, BYTE *_CardID, char *RecordInfo);
	int __stdcall K720_S70LoadSecKey(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE _KEYType, BYTE *_KEY, char *RecordInfo);
	int __stdcall K720_S70ReadBlock(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_BlockData, char *RecordInfo);
	int __stdcall K720_S70WriteBlock(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_BlockData, char *RecordInfo);
	int __stdcall K720_S70InitValue(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data, char *RecordInfo);
	int __stdcall K720_S70Increment(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data, char *RecordInfo);
	int __stdcall K720_S70Decrement(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data, char *RecordInfo);
	int __stdcall K720_S70Halt(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);

	//////////////////////////////RF610 UL卡片操作函数////////////////////////////
	int __stdcall K720_ULDetectCard(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);
	int __stdcall K720_ULGetCardID(HANDLE ComHandle, BYTE MacAddr, BYTE *_CardID, char *RecordInfo);
	int __stdcall K720_ULReadBlock(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE *_BlockData, char *RecordInfo);
	int __stdcall K720_ULWriteBlock(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE *_BlockData, char *RecordInfo);
	int __stdcall K720_ULGetCardID_ex(HANDLE ComHandle, BYTE MacAddr, BYTE *_CardID, char *RecordInfo);
	int __stdcall K720_ULReadBlock_ex(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE *_BlockData, char *RecordInfo);
	int __stdcall K720_ULWriteBlock_ex(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE *_BlockData, char *RecordInfo);
	int __stdcall K720_ULCompatibilityWriteBlock_ex(HANDLE ComHandle, BYTE MacAddr, BYTE SectorAddr, BYTE *_BlockData, char *RecordInfo);
	int __stdcall K720_ULLoadSecKey_ex(HANDLE ComHandle, BYTE MacAddr, BYTE *_Key, char *RecordInfo);
	int __stdcall K720_ULWriteSecKey_ex(HANDLE ComHandle, BYTE MacAddr, BYTE *_Key, char *RecordInfo);
	int __stdcall K720_ULHalt(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);

	/////////////////////////////CPU卡操作函数/////////////////////////////////////
	int __stdcall K720_CPUCardPowerOn(HANDLE ComHandle, BYTE MacAddr, BYTE *szATR, char *RecordInfo);
	int __stdcall K720_CPUAPDU(HANDLE ComHandle, BYTE MacAddr, BYTE SCH, int _dataLen, BYTE _APDUData[], BYTE* RCH,BYTE _exData[], int *_exdataLen, char *RecordInfo);

	int __stdcall K720_CPUTypeBCardPowerOn(HANDLE ComHandle, BYTE MacAddr, BYTE *szATR, char *RecordInfo);
	int __stdcall K720_CPUTypeBAPDU(HANDLE ComHandle, BYTE MacAddr, BYTE SCH, int _dataLen, BYTE _APDUData[], BYTE* RCH,BYTE _exData[], int *_exdataLen, char *RecordInfo);
	int __stdcall K720_CPUTypeBCardPowerOff(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);
	/**********************************D1801操作函数***************************************************/
	int __stdcall K720_GetVersion(HANDLE ComHandle, BYTE MacAddr, BYTE Version[20], char *RecordInfo);
	int __stdcall K720_SendCmd(HANDLE ComHandle, unsigned char MacAddr, char *p_Cmd, int CmdLen, char *RecordInfo);
	int __stdcall K720_Query(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo[3], char *RecordInfo);
	int __stdcall K720_SensorQuery(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo[4], char *RecordInfo);
	int __stdcall K720_GetCountSum(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo[11], char *RecordInfo);
	int __stdcall K720_ClearSendCount(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);
	int __stdcall K720_ClearRecycleCount(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);
	int __stdcall K720_AutoTestMac(HANDLE ComHandle, unsigned char MacAddr, char *RecordInfo);

	/**********************************15693操作函数***************************************************/
	int __stdcall K720_15693LockDSFID(HANDLE ComHandle,BYTE MacAddr,bool bUid,BYTE Uid[8], char *RecordInfo);
	int __stdcall K720_15693LockAFI(HANDLE ComHandle,BYTE MacAddr,bool bUid,BYTE Uid[8], char *RecordInfo);
	int __stdcall K720_15693LockBlock(HANDLE ComHandle,BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE LockAddress, char *RecordInfo);
	int __stdcall K720_15693WriteAFI(HANDLE ComHandle,BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE WriteBit, char *RecordInfo);
	int __stdcall K720_15693WriteDSFID(HANDLE ComHandle,BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE WriteBit, char *RecordInfo);
	int __stdcall K720_15693ReadSafeBit(HANDLE ComHandle, BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE BlockAddr, BYTE BlockLen,BYTE* ReadBlockLen,BYTE BlockLockStatus[], char *RecordInfo);
	int __stdcall K720_15693GetMessage(HANDLE ComHandle, BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE Message[15], char *RecordInfo);
	int __stdcall K720_15693ChooseCard(HANDLE ComHandle,BYTE MacAddr,bool bUid,BYTE Uid[8], char *RecordInfo);
	int __stdcall K720_15693WriteData(HANDLE ComHandle, BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE BlockAddr, BYTE BlockLen, BYTE _BlockData[],BYTE *WriteBlockLen, char *RecordInfo);
	int __stdcall K720_15693ReadData(HANDLE ComHandle, BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE BlockAddr, BYTE BlockLen, BYTE _BlockData[],BYTE* ReadBlockLen, char *RecordInfo);
	int __stdcall K720_15693GetUid(HANDLE ComHandle, BYTE MacAddr, BYTE UID[8], char *RecordInfo);
	int __stdcall K720_CheckSetting(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo[], char *RecordInfo);

	int __stdcall K720_MoveCard(BYTE _PM);
	int __stdcall K720_RetainToCardBox(BOOL flag, int EnterTimeOut, int TimeOut);
	int __stdcall K720_CheckCardPosition(BYTE *DeviceStatus, BYTE *TransportStatus, BYTE *CardBoxStatus, BYTE *RetainBoxStatus);
	int __stdcall K720_ReadAlcoholCuurentVoltage(HANDLE ComHandle, BYTE MacAddr, BYTE *StateInfo, char *RecordInfo);
	int __stdcall K720_ReadAlcoholSetVoltage(HANDLE ComHandle, BYTE MacAddr, BYTE *StateInfo, char *RecordInfo);
	int __stdcall K720_WriteAlcoholSetVoltage(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo, char *RecordInfo);
	int __stdcall K720_ResetAlcoholMode(HANDLE ComHandle, BYTE MacAddr, char *RecordInfo);
	int __stdcall K720_ReadAlcoholCuurentHumidity(HANDLE ComHandle, BYTE MacAddr, BYTE *StateInfo, char *RecordInfo);
	int __stdcall K720_WriteAlcoholCuurentHumidity(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo, char *RecordInfo);
	int __stdcall K720_ReadAlcoholPowerTime(HANDLE ComHandle, BYTE MacAddr, BYTE *StateInfo, char *RecordInfo);
	int __stdcall K720_WriteAlcoholPowerTime(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo, char *RecordInfo);
	int __stdcall K720_GetMachineIDNum(HANDLE ComHandle, BYTE MacAddr, BYTE *length, BYTE* data, char *RecordInfo);
	int __stdcall K720_SetMachineIDNum(HANDLE ComHandle, BYTE MacAddr, BYTE length, BYTE *data, char *RecordInfo);
	int __stdcall K720_ReadBarcode(HANDLE ComHandle, BYTE MacAddr, BYTE data[], char *RecordInfo);
	int __stdcall K720_checkstatus(HANDLE ComHandle, BYTE StateInfo[]);
	int __stdcall K720_checkvoltage(HANDLE ComHandle, BYTE StateInfo[]);
	int __stdcall K720_ForceMove(HANDLE ComHandle);
	/*****************************************USB操作接口***************************************************/
	int __stdcall K720_USB_OpenRU(HANDLE* HidHandle);
	int __stdcall K720_USB_CloseRU(HANDLE* HidHandle);
	
	int __stdcall K720_USB_AutoTestRFIDCard(HANDLE HidHandle, BYTE MacAddr, BYTE* cardtype);
	int __stdcall K720_USB_S50DetectCard(HANDLE HidHandle, BYTE MacAddr);
	int __stdcall K720_USB_S50GetCardID(HANDLE HidHandle, BYTE MacAddr, BYTE *_CardID);
	int __stdcall K720_USB_S50LoadSecKey(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE _KEYType, BYTE *_KEY);
	int __stdcall K720_USB_S50ReadBlock(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_BlockData);
	int __stdcall K720_USB_S50WriteBlock(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr,BYTE *_BlockData);
	int __stdcall K720_USB_S50InitValue(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data);
	int __stdcall K720_USB_S50Increment(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data);
	int __stdcall K720_USB_S50Decrement(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data);
	int __stdcall K720_USB_S50Halt(HANDLE HidHandle, BYTE MacAddr);


	//////////////////////////////RF610 S70卡片操作函数////////////////////////////
	int __stdcall K720_USB_S70DetectCard(HANDLE HidHandle, BYTE MacAddr);
	int __stdcall K720_USB_S70GetCardID(HANDLE HidHandle, BYTE MacAddr, BYTE *_CardID);
	int __stdcall K720_USB_S70LoadSecKey(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE _KEYType, BYTE *_KEY);
	int __stdcall K720_USB_S70ReadBlock(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_BlockData);
	int __stdcall K720_USB_S70WriteBlock(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_BlockData);
	int __stdcall K720_USB_S70InitValue(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data);
	int __stdcall K720_USB_S70Increment(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data);
	int __stdcall K720_USB_S70Decrement(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE BlockAddr, BYTE *_Data);
	int __stdcall K720_USB_S70Halt(HANDLE HidHandle, BYTE MacAddr);


	//////////////////////////////RF610 UL卡片操作函数////////////////////////////
	int __stdcall K720_USB_ULDetectCard(HANDLE HidHandle, BYTE MacAddr);
	int __stdcall K720_USB_ULGetCardID(HANDLE HidHandle, BYTE MacAddr, BYTE *_CardID);
	int __stdcall K720_USB_ULReadBlock(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE *_BlockData);
	int __stdcall K720_USB_ULWriteBlock(HANDLE HidHandle, BYTE MacAddr, BYTE SectorAddr, BYTE *_BlockData);
	int __stdcall K720_USB_ULHalt(HANDLE HidHandle, BYTE MacAddr);

	/////////////////////////////CPU卡操作函数/////////////////////////////////////
	int __stdcall K720_USB_CPUCardPowerOn(HANDLE HidHandle, BYTE MacAddr, BYTE *szATR);
	int __stdcall K720_USB_CPUAPDU(HANDLE HidHandle, BYTE MacAddr, BYTE SCH, int _dataLen, BYTE _APDUData[], BYTE* RCH,BYTE _exData[], int *_exdataLen);

	int __stdcall K720_USB_CPUTypeBCardPowerOn(HANDLE HidHandle, BYTE MacAddr, BYTE *szATR);
	int __stdcall K720_USB_CPUTypeBAPDU(HANDLE HidHandle, BYTE MacAddr, BYTE SCH, int _dataLen, BYTE _APDUData[], BYTE* RCH,BYTE _exData[], int *_exdataLen);
	int __stdcall K720_USB_CPUTypeBCardPowerOff(HANDLE HidHandle, BYTE MacAddr);

	/**********************************D1801操作函数***************************************************/
	int __stdcall K720_USB_GetVersion(HANDLE HidHandle, BYTE MacAddr, BYTE Version[20]);
	int __stdcall K720_USB_SendCmd(HANDLE HidHandle, unsigned char MacAddr, char *p_Cmd, int CmdLen);
	int __stdcall K720_USB_Query(HANDLE HidHandle, BYTE MacAddr, BYTE StateInfo[3]);
	int __stdcall K720_USB_SensorQuery(HANDLE HidHandle, BYTE MacAddr, BYTE StateInfo[4]);
	int __stdcall K720_USB_GetCountSum(HANDLE HidHandle, BYTE MacAddr, BYTE StateInfo[11]);
	int __stdcall K720_USB_ClearSendCount(HANDLE HidHandle, BYTE MacAddr);
	int __stdcall K720_USB_ClearRecycleCount(HANDLE HidHandle, BYTE MacAddr);
	int __stdcall K720_USB_AutoTestMac(HANDLE HidHandle, unsigned char MacAddr);


	/**********************************15693操作函数***************************************************/
	int __stdcall K720_USB_15693LockDSFID(HANDLE HidHandle,BYTE MacAddr,bool bUid,BYTE Uid[8]);
	int __stdcall K720_USB_15693LockAFI(HANDLE HidHandle,BYTE MacAddr,bool bUid,BYTE Uid[8]);
	int __stdcall K720_USB_15693LockBlock(HANDLE HidHandle,BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE LockAddress);
	int __stdcall K720_USB_15693WriteAFI(HANDLE HidHandle,BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE WriteBit);
	int __stdcall K720_USB_15693WriteDSFID(HANDLE HidHandle,BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE WriteBit);
	int __stdcall K720_USB_15693ReadSafeBit(HANDLE HidHandle, BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE BlockAddr, BYTE BlockLen,BYTE* ReadBlockLen,BYTE BlockLockStatus[]);
	int __stdcall K720_USB_15693GetMessage(HANDLE HidHandle, BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE Message[15]);
	int __stdcall K720_USB_15693ChooseCard(HANDLE HidHandle,BYTE MacAddr,bool bUid,BYTE Uid[8]);
	int __stdcall K720_USB_15693WriteData(HANDLE HidHandle, BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE BlockAddr, BYTE BlockLen, BYTE _BlockData[],BYTE *WriteBlockLen);
	int __stdcall K720_USB_15693ReadData(HANDLE HidHandle, BYTE MacAddr,bool bUid,BYTE Uid[8],BYTE BlockAddr, BYTE BlockLen, BYTE _BlockData[],BYTE* ReadBlockLen);
	int __stdcall K720_USB_15693GetUid(HANDLE HidHandle, BYTE MacAddr, BYTE UID[8]);
	int __stdcall K720_USB_CheckSetting(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo[]);
	void __stdcall SetTimeOutFunction(int TimeOut);
	int __stdcall K720_USB_MoveCard(BYTE _PM);
	int __stdcall K720_USB_RetainToCardBox(BOOL flag, int EnterTimeOut, int TimeOut);
	int __stdcall K720_USB_CheckCardPosition(BYTE *DeviceStatus, BYTE *TransportStatus, BYTE *CardBoxStatus, BYTE *RetainBoxStatus);
	int __stdcall K720_USB_ReadAlcoholCuurentVoltage(HANDLE ComHandle, BYTE MacAddr, BYTE *StateInfo);
	int __stdcall K720_USB_ReadAlcoholSetVoltage(HANDLE ComHandle, BYTE MacAddr, BYTE *StateInfo);
	int __stdcall K720_USB_WriteAlcoholSetVoltage(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo);
	int __stdcall K720_USB_ResetAlcoholMode(HANDLE ComHandle, BYTE MacAddr);
	int __stdcall K720_USB_ReadAlcoholCuurentHumidity(HANDLE ComHandle, BYTE MacAddr, BYTE *StateInfo);
	int __stdcall K720_USB_WriteAlcoholCuurentHumidity(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo);
	int __stdcall K720_USB_ReadAlcoholPowerTime(HANDLE ComHandle, BYTE MacAddr, BYTE *StateInfo);
	int __stdcall K720_USB_WriteAlcoholPowerTime(HANDLE ComHandle, BYTE MacAddr, BYTE StateInfo);
	int __stdcall K720_USB_SetMachineIDNum(HANDLE ComHandle, BYTE MacAddr, BYTE length, BYTE *data);
	int __stdcall K720_USB_GetMachineIDNum(HANDLE ComHandle, BYTE MacAddr, BYTE *length, BYTE* data);
	int __stdcall K720_USB_ReadBarcode(HANDLE HidHandle, BYTE MacAddr, BYTE data[]);
	int __stdcall K720_USB_checkstatus(HANDLE HidHandle, BYTE StateInfo[]);
	int __stdcall K720_USB_checkvoltage(HANDLE HidHandle, BYTE StateInfo[]);
	int __stdcall K720_USB_ForceMove(HANDLE HidHandle);
#ifdef __cplusplus
}
#endif

#endif