import { PublicKey } from '@solana/web3.js';
import { connection } from './solana';
import { checkIfScam } from './supabase';
import { getCachedData, setCachedData } from './cache';

// Get delegate wallet age
export async function getDelegateAge(delegateAddress) {
  try {
    console.log('🔍 Checking delegate age:', delegateAddress.slice(0, 8));
    
    const cached = getCachedData('delegate_age', delegateAddress);
    if (cached !== null) return cached;
    
    const publicKey = new PublicKey(delegateAddress);
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 1,
    }, 'confirmed');
    
    if (signatures.length === 0) {
      console.log('⚠️ Delegate has no transactions');
      setCachedData('delegate_age', delegateAddress, 0);
      return 0;
    }
    
    const firstTxTimestamp = signatures[0].blockTime;
    const createdDate = new Date(firstTxTimestamp * 1000);
    const now = new Date();
    const ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    console.log('✅ Delegate age:', ageInDays, 'days');
    setCachedData('delegate_age', delegateAddress, ageInDays);
    return ageInDays;
    
  } catch (error) {
    console.error('❌ Error fetching delegate age:', error);
    return 0;
  }
}

// Get delegate transaction count
export async function getDelegateTransactionCount(delegateAddress) {
  try {
    console.log('🔍 Checking delegate transactions:', delegateAddress.slice(0, 8));
    
    const cached = getCachedData('delegate_tx_count', delegateAddress);
    if (cached !== null) return cached;
    
    const publicKey = new PublicKey(delegateAddress);
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 1000,
    }, 'confirmed');
    
    const count = signatures.length;
    console.log('✅ Delegate tx count:', count);
    
    setCachedData('delegate_tx_count', delegateAddress, count);
    return count;
    
  } catch (error) {
    console.error('❌ Error fetching delegate tx count:', error);
    return 0;
  }
}

// Check if delegate is scammer
export async function isDelegateScammer(delegateAddress) {
  try {
    const cached = getCachedData('delegate_scammer', delegateAddress);
    if (cached !== null) return cached;
    
    const scamCheck = await checkIfScam(delegateAddress);
    const isScammer = scamCheck.isScam;
    
    console.log(isScammer ? '🚨 Delegate IS scammer!' : '✅ Delegate not scammer');
    
    setCachedData('delegate_scammer', delegateAddress, isScammer);
    return isScammer;
    
  } catch (error) {
    console.error('❌ Error checking delegate:', error);
    return false;
  }
}

// Get all intelligence at once
export async function getDelegateIntelligence(delegateAddress) {
  console.log('🎯 Gathering intelligence:', delegateAddress.slice(0, 8));
  
  try {
    const [age, txCount, isScammer] = await Promise.all([
      getDelegateAge(delegateAddress),
      getDelegateTransactionCount(delegateAddress),
      isDelegateScammer(delegateAddress)
    ]);
    
    return {
      address: delegateAddress,
      age,
      txCount,
      isScammer,
      ageLabel: age === 0 ? 'New/Unused' : 
                age < 7 ? 'Very New (<1 week)' :
                age < 30 ? 'New (<1 month)' :
                age < 90 ? 'Growing (<3 months)' :
                'Established (3+ months)',
      txCountLabel: txCount === 0 ? 'No transactions' :
                    txCount < 10 ? 'Very Few (<10)' :
                    txCount < 100 ? 'Few (<100)' :
                    txCount < 1000 ? 'Moderate (<1000)' :
                    'Many (1000+)'
    };
    
  } catch (error) {
    console.error('❌ Error gathering intelligence:', error);
    return {
      address: delegateAddress,
      age: 0,
      txCount: 0,
      isScammer: false,
      ageLabel: 'Unknown',
      txCountLabel: 'Unknown'
    };
  }
}