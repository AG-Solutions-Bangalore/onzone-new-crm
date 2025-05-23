 const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      return await axios.delete(`${BASE_URL}/api/delete-ratio-by-id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (response) => {
      refetch();
      setDeleteConfirmOpen(false);
      toast({
        title: "Success",
        description: `${response.data.msg}`,
      });
    },
    onError: (error) => {
      console.error("Error deleting ratio:", error);
      toast({
        title: "Error",
        description: "Failed to delete ratio.",
      });
    },
  });