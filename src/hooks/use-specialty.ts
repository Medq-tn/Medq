
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Specialty, Lecture } from '@/types';

export function useSpecialty(specialtyId: string | undefined) {
  const router = useRouter();
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isAddLectureOpen, setIsAddLectureOpen] = useState(false);

  const fetchSpecialtyAndLectures = async () => {
    if (!specialtyId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Fetching specialty with ID:', specialtyId);
      
      // Fetch specialty using our new API
      const specialtyResponse = await fetch(`/api/specialties/${specialtyId}`);
      
      if (!specialtyResponse.ok) {
        throw new Error(`Failed to fetch specialty: ${specialtyResponse.statusText}`);
      }
      
      const specialtyData = await specialtyResponse.json();
      
      if (!specialtyData) {
        console.warn('No specialty found with ID:', specialtyId);
        setSpecialty(null);
        setLectures([]);
  console.warn('Specialty not found');
      } else {
        console.log('Successfully fetched specialty:', specialtyData);
        setSpecialty(specialtyData);
        
        // Fetch lectures for this specialty using our new API
        const lecturesResponse = await fetch(`/api/lectures?specialtyId=${specialtyId}`);
        
        if (!lecturesResponse.ok) {
          console.error('Error fetching lectures:', lecturesResponse.statusText);
          // Don't throw for lectures error, just set empty array
          setLectures([]);
        } else {
          const lecturesData = await lecturesResponse.json();
          console.log('Successfully fetched lectures:', lecturesData?.length || 0);
          setLectures(lecturesData || []);
          
          // Set the first lecture as default if available
          if (lecturesData && lecturesData.length > 0) {
            setSelectedLectureId(lecturesData[0].id);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
  // no toast: log only
      // Only navigate away if we're on the specialty page
      if (window.location.pathname.includes('/specialty/')) {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialtyAndLectures();
  }, [specialtyId]);

  const handleOpenAddQuestion = (lectureId: string) => {
    setSelectedLectureId(lectureId);
    setIsAddQuestionOpen(true);
  };

  return {
    specialty,
    lectures,
    isLoading,
    selectedLectureId,
    setSelectedLectureId,
    isAddQuestionOpen,
    setIsAddQuestionOpen,
    isAddLectureOpen,
    setIsAddLectureOpen,
    fetchSpecialtyAndLectures,
    handleOpenAddQuestion,
  };
}
